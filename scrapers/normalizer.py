"""Normalize visible offer text into structured fields for admin review.

This module intentionally returns low-confidence data. Admins should verify source URLs
before marking any offer as verified.
"""

import re


def normalize_offer_text(text: str) -> dict:
    percent = re.search(r"(\d+(?:\.\d+)?)\s*%", text)
    cap = re.search(r"(?:up to|upto|max)\s*(?:rs\.?|₹)?\s*(\d+)", text, re.I)
    minimum = re.search(r"(?:above|min(?:imum)?)\s*(?:rs\.?|₹)?\s*(\d+)", text, re.I)
    return {
        "offer_text": text.strip(),
        "discount_type": "percentage" if percent else "custom",
        "discount_percent": float(percent.group(1)) if percent else None,
        "maximum_discount_cap": float(cap.group(1)) if cap else None,
        "minimum_bill": float(minimum.group(1)) if minimum else None,
        "verification_status": "needs_review",
        "confidence_score": 0.45,
    }
