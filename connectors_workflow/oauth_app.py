import os
import json
from pathlib import Path

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" #delete this line later

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from google_auth_oauthlib.flow import Flow

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = BASE_DIR / "gmail" / "credentials.json"
TOKEN_FILE = BASE_DIR / "gmail" / "token.json"

REDIRECT_URI = "http://localhost:8000/auth/gmail/callback"
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

app = FastAPI(title="MindMesh Gmail OAuth")

secret = os.getenv("SESSION_SECRET")
if not secret:
    raise RuntimeError("SESSION_SECRET is missing from your .env file")

app.add_middleware(
    SessionMiddleware,
    secret_key=secret,
    same_site="lax",
    https_only=False,  # Local development only
)


def create_flow(state=None):
    if not CREDENTIALS_FILE.exists():
        raise FileNotFoundError(
            f"OAuth credentials not found: {CREDENTIALS_FILE}"
        )

    flow = Flow.from_client_secrets_file(
        str(CREDENTIALS_FILE),
        scopes=SCOPES,
        state=state,
        redirect_uri=REDIRECT_URI,
    )
    return flow


@app.get("/")
def home():
    return {
        "app": "MindMesh Gmail OAuth",
        "message": "Open /auth/gmail to connect your Gmail account."
    }


@app.get("/auth/gmail")
def start_gmail_oauth(request: Request):
    flow = create_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )

    request.session["oauth_state"] = state
    request.session["code_verifier"] = flow.code_verifier

    return RedirectResponse(authorization_url)


@app.get("/auth/gmail/callback")
def gmail_oauth_callback(request: Request):
    state = request.session.get("oauth_state")

    if not state:
        return JSONResponse(
            {"error": "OAuth state missing. Start again at /auth/gmail."},
            status_code=400,
        )

    if request.query_params.get("error"):
        return JSONResponse(
            {"error": request.query_params.get("error")},
            status_code=400,
        )

    flow = create_flow(state=state)
    flow.code_verifier = request.session.get("code_verifier")

    try:
        flow.fetch_token(authorization_response=str(request.url))
    except Exception as exc:
        return JSONResponse(
            {
                "error": "Google OAuth failed",
                "details": str(exc),
                "hint": "Check the registered redirect URI and try again.",
            },
            status_code=400,
        )

    credentials = flow.credentials

    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_FILE.write_text(credentials.to_json(), encoding="utf-8")

    request.session.pop("oauth_state", None)

    return {
        "success": True,
        "message": "Gmail connected. Your token was saved locally.",
        "next_step": "Run python main.py to import your emails.",
        "token_file": "gmail/token.json",
    }