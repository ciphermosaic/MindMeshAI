from privacy_filter import sanitize_records

test_messages = [
    {
        "source": "telegram",
        "sender": "Telegram",
        "subject": "Telegram",
        "text": "Login code: 12345. Do not give this code to anyone.",
    },
    {
        "source": "telegram",
        "sender": "Ashraf743",
        "subject": "College Group",
        "text": "Assignment submission is Friday. Contact me at student@example.com",
    },
    {
        "source": "gmail",
        "sender": "teacher@example.com",
        "subject": "Assignment deadline",
        "text": "Submit the assignment by Friday.",
    },
]

clean_messages = sanitize_records(test_messages)

for message in clean_messages:
    print(message["sender"], ":", message["text"])

assert len(clean_messages) == 2
assert "12345" not in str(clean_messages)
assert "student@example.com" not in str(clean_messages)
assert "Friday" in str(clean_messages)

print("\nAll privacy filter tests passed!")