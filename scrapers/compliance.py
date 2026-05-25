"""Compliance helpers for future offer checking.

Production automation must use approved APIs, partnerships, or legally allowed public pages only.
Never bypass login, CAPTCHA, robots.txt, paywalls, private APIs, or technical access controls.
"""

from urllib import robotparser


def robots_allows(base_url: str, path: str, user_agent: str = "DineDealBot") -> bool:
    parser = robotparser.RobotFileParser()
    parser.set_url(base_url.rstrip("/") + "/robots.txt")
    parser.read()
    return parser.can_fetch(user_agent, path)
