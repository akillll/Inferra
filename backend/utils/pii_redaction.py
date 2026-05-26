import re

EMAIL_REGEX = r'[\w\.-]+@[\w\.-]+\.\w+'

PHONE_REGEX = r'\+?\d[\d\s\-]{8,}\d'


def redact_pii(text: str):

    text = re.sub(
        EMAIL_REGEX,
        "[REDACTED_EMAIL]",
        text
    )

    text = re.sub(
        PHONE_REGEX,
        "[REDACTED_PHONE]",
        text
    )

    return text