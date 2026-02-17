"""
E2E Test Helpers

Helper modules for end-to-end testing with Playwright.
"""

from .auth import (
    login_as_admin,
    login_as_agent,
    login_with_credentials,
    create_authenticated_context,
    save_storage_state,
    load_storage_state,
    get_auth_token,
    set_auth_token_in_browser,
    is_authenticated,
    logout,
    DEFAULT_ADMIN_CREDENTIALS,
    DEFAULT_AGENT_CREDENTIALS,
)

__all__ = [
    "login_as_admin",
    "login_as_agent",
    "login_with_credentials",
    "create_authenticated_context",
    "save_storage_state",
    "load_storage_state",
    "get_auth_token",
    "set_auth_token_in_browser",
    "is_authenticated",
    "logout",
    "DEFAULT_ADMIN_CREDENTIALS",
    "DEFAULT_AGENT_CREDENTIALS",
]
