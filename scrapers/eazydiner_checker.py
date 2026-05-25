"""Future EazyDiner checker scaffold.

Use approved APIs, partnerships, or legally allowed public pages only.
Do not bypass login, CAPTCHA, robots.txt, private APIs, paywalls, or access controls.
"""

from normalizer import normalize_offer_text


def check_visible_offer(platform_url: str) -> dict:
    # Placeholder: load public page only after robots.txt and terms review.
    visible_text = ""
    return normalize_offer_text(visible_text) if visible_text else {"verification_status": "needs_review", "confidence_score": 0}
