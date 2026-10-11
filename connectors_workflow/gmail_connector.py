import base64
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from normalizer import normalize_message


BASE_DIR = Path(__file__).resolve().parent
GMAIL_DIR = BASE_DIR / "gmail"
TOKEN_FILE = GMAIL_DIR / "token.json"
CHECKPOINT_FILE = GMAIL_DIR / "sync_checkpoint.json"

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def get_gmail_service():
    if not TOKEN_FILE.exists():
        raise FileNotFoundError(
            "Gmail token not found. Complete OAuth login first at "
            "http://localhost:8000/auth/gmail"
        )

    credentials = Credentials.from_authorized_user_file(
        str(TOKEN_FILE), SCOPES
    )

    if not credentials.valid:
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            TOKEN_FILE.write_text(
                credentials.to_json(), encoding="utf-8"
            )
        else:
            raise RuntimeError(
                "Gmail authorization expired. Please reconnect Gmail."
            )

    return build("gmail", "v1", credentials=credentials)


def get_header(headers, name):
    for header in headers:
        if header.get("name", "").lower() == name.lower():
            return header.get("value", "")
    return ""


def decode_body(payload):
    mime_type = payload.get("mimeType", "")
    data = payload.get("body", {}).get("data")

    if mime_type == "text/plain" and data:
        return base64.urlsafe_b64decode(data).decode(
            "utf-8", errors="replace"
        )

    text_parts = []

    for part in payload.get("parts", []):
        if part.get("mimeType") == "text/plain":
            part_data = part.get("body", {}).get("data")
            if part_data:
                text_parts.append(
                    base64.urlsafe_b64decode(part_data).decode(
                        "utf-8", errors="replace"
                    )
                )
        elif part.get("parts"):
            nested_text = decode_body(part)
            if nested_text:
                text_parts.append(nested_text)

    return "\n".join(text_parts)


def load_checkpoint():
    if not CHECKPOINT_FILE.exists():
        return None

    with CHECKPOINT_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_checkpoint(account_id, history_id):
    GMAIL_DIR.mkdir(parents=True, exist_ok=True)

    temp_file = CHECKPOINT_FILE.with_suffix(".tmp")
    temp_file.write_text(
        json.dumps(
            {
                "account_id": account_id,
                "history_id": str(history_id),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    temp_file.replace(CHECKPOINT_FILE)


def get_message(service, message_id, account_id):
    email = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full",
    ).execute()

    payload = email.get("payload", {})
    headers = payload.get("headers", [])

    internal_date = email.get("internalDate")
    timestamp = (
        datetime.fromtimestamp(
            int(internal_date) / 1000,
            tz=timezone.utc,
        ).isoformat()
        if internal_date
        else None
    )

    return normalize_message(
        source="gmail",
        message_id=email["id"],
        conversation_id=email.get("threadId"),
        sender=get_header(headers, "From"),
        subject=get_header(headers, "Subject"),
        text=decode_body(payload),
        timestamp=timestamp,
        account_id=account_id,
    )


def fetch_initial_messages(service, days=2, max_results=500):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    query = f"after:{int(cutoff.timestamp())}"

    messages = []
    page_token = None

    while len(messages) < max_results:
        result = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=min(100, max_results - len(messages)),
            pageToken=page_token,
        ).execute()

        for item in result.get("messages", []):
            messages.append(item["id"])

            if len(messages) >= max_results:
                break

        page_token = result.get("nextPageToken")
        if not page_token or len(messages) >= max_results:
            break

    return messages


def fetch_incremental_messages(service, start_history_id, max_results=500):
    message_ids = set()
    page_token = None

    while len(message_ids) < max_results:
        kwargs = {
            "userId": "me",
            "startHistoryId": str(start_history_id),
            "historyTypes": ["messageAdded"],
            "maxResults": 500,
        }

        if page_token:
            kwargs["pageToken"] = page_token

        result = service.users().history().list(**kwargs).execute()

        for history in result.get("history", []):
            for entry in history.get("messagesAdded", []):
                message_ids.add(entry["message"]["id"])

                if len(message_ids) >= max_results:
                    break

            if len(message_ids) >= max_results:
                break

        page_token = result.get("nextPageToken")
        if not page_token or len(message_ids) >= max_results:
            break

    return list(message_ids)


def fetch_gmail(days=2, max_results=500):
    service = get_gmail_service()

    profile = service.users().getProfile(userId="me").execute()
    account_id = profile["emailAddress"]
    current_history_id = str(profile["historyId"])

    checkpoint = load_checkpoint()

    # A checkpoint belongs to one Gmail account.
    if checkpoint and checkpoint.get("account_id") != account_id:
        raise RuntimeError(
            "The saved Gmail checkpoint belongs to another account. "
            "Use a separate checkpoint for each connected account."
        )

    try:
        if checkpoint:
            start_history_id = checkpoint["history_id"]
            print(f"Incremental Gmail sync for {account_id}...")

            try:
                message_ids = fetch_incremental_messages(
                    service,
                    start_history_id,
                    max_results,
                )
            except HttpError as exc:
                if exc.resp.status != 404:
                    raise

                raise RuntimeError(
                    "Gmail history checkpoint expired. A fresh initial "
                    "sync is required; do not delete existing messages."
                ) from exc
        else:
            print(f"Initial Gmail import for {account_id}...")
            message_ids = fetch_initial_messages(
                service, days=days, max_results=max_results
            )

        messages = []
        for message_id in message_ids:
            try:
                messages.append(
                    get_message(service, message_id, account_id)
                )
            except HttpError as exc:
                # A message may have been deleted between listing and fetch.
                if exc.resp.status == 404:
                    continue
                raise

        # Advance to the profile history ID observed at the start.
        # For a production system, checkpoint commits should happen only
        # after sanitized records are durably stored.
        save_checkpoint(account_id, current_history_id)

        return messages

    except HttpError as exc:
        raise RuntimeError(
            f"Gmail API request failed: {exc}"
        ) from exc