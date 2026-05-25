"""Future District checker scaffold with strict legal limits."""

from normalizer import normalize_offer_text


def check_visible_offer(platform_url: str) -> dict:
    visible_text = ""
    return normalize_offer_text(visible_text) if visible_text else {"verification_status": "needs_review", "confidence_score": 0}
