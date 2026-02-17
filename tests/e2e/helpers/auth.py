"""
Authentication helpers for E2E tests using Playwright.

Provides helper functions to authenticate users in Payload CMS admin
during end-to-end testing.
"""

import os
from typing import Dict, Any, Optional
import requests
from playwright.sync_api import Page, BrowserContext
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)


# =============================================================================
# DEFAULT CREDENTIALS
# =============================================================================

DEFAULT_ADMIN_CREDENTIALS = {
    "email": os.getenv("PAYLOAD_ADMIN_EMAIL", "admin@primeurban.test"),
    "password": os.getenv("PAYLOAD_ADMIN_PASSWORD", "test-admin-pass-123"),
}

DEFAULT_AGENT_CREDENTIALS = {
    "email": os.getenv("PAYLOAD_AGENT_EMAIL", "agent@primeurban.test"),
    "password": os.getenv("PAYLOAD_AGENT_PASSWORD", "test-agent-pass-123"),
}


# =============================================================================
# AUTHENTICATION FUNCTIONS
# =============================================================================

def login_as_admin(
    page: Page,
    base_url: str = "http://localhost:3000",
    credentials: Optional[Dict[str, str]] = None
) -> None:
    """
    Log in as admin user in Payload CMS admin panel.

    Args:
        page: Playwright Page instance
        base_url: Base URL of the application
        credentials: Dict with 'email' and 'password' keys (optional)

    Raises:
        AssertionError: If login fails
    """
    creds = credentials or DEFAULT_ADMIN_CREDENTIALS
    _perform_login(page, base_url, creds)


def login_as_agent(
    page: Page,
    base_url: str = "http://localhost:3000",
    credentials: Optional[Dict[str, str]] = None
) -> None:
    """
    Log in as agent user in Payload CMS admin panel.

    Args:
        page: Playwright Page instance
        base_url: Base URL of the application
        credentials: Dict with 'email' and 'password' keys (optional)

    Raises:
        AssertionError: If login fails
    """
    creds = credentials or DEFAULT_AGENT_CREDENTIALS
    _perform_login(page, base_url, creds)


def login_with_credentials(
    page: Page,
    email: str,
    password: str,
    base_url: str = "http://localhost:3000"
) -> None:
    """
    Log in with custom credentials.

    Args:
        page: Playwright Page instance
        email: User email
        password: User password
        base_url: Base URL of the application

    Raises:
        AssertionError: If login fails
    """
    _perform_login(page, base_url, {"email": email, "password": password})


def _perform_login(
    page: Page,
    base_url: str,
    credentials: Dict[str, str]
) -> None:
    """
    Perform the actual login flow.

    Args:
        page: Playwright Page instance
        base_url: Base URL of the application
        credentials: Dict with 'email' and 'password' keys

    Raises:
        AssertionError: If login fails
    """
    admin_url = f"{base_url}/admin"

    # Navigate to admin panel
    page.goto(admin_url)
    page.wait_for_load_state("networkidle")

    # Wait a bit for client-side rendering
    page.wait_for_timeout(1000)

    # Check if already logged in (redirected to dashboard/collections)
    if "/admin/collections" in page.url or "/admin/dashboard" in page.url:
        return

    # Fill login form - try multiple selectors for robustness
    email_input = None
    password_input = None

    # Try different selectors for email input
    for selector in ['input[type="email"]', 'input[name="email"]', 'input[id*="email"]', 'input[placeholder*="email" i]']:
        try:
            elem = page.locator(selector).first
            if elem.is_visible(timeout=1000):
                email_input = elem
                break
        except Exception:
            continue

    # Try different selectors for password input
    for selector in ['input[type="password"]', 'input[name="password"]', 'input[id*="password"]', 'input[placeholder*="password" i]']:
        try:
            elem = page.locator(selector).first
            if elem.is_visible(timeout=1000):
                password_input = elem
                break
        except Exception:
            continue

    if not email_input or not password_input:
        # If no form found, might already be logged in
        if "/login" not in page.url.lower():
            return
        raise AssertionError(f"Could not find login form elements at {page.url}")

    email_input.fill(credentials["email"])
    password_input.fill(credentials["password"])

    # Submit form - try multiple selectors
    submit_button = None
    for selector in [
        'button[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Entrar")',
        'button:has-text("Sign in")',
        'input[type="submit"]',
    ]:
        try:
            elem = page.locator(selector).first
            if elem.is_visible(timeout=500):
                submit_button = elem
                break
        except Exception:
            continue

    if not submit_button:
        raise AssertionError("Could not find submit button")

    submit_button.click()

    # Wait for navigation/redirect
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Verify login success (redirected away from login page)
    # Successful login should redirect to /admin/collections or /admin/dashboard
    # Failed login typically stays on /admin/login or /admin with login form
    current_url = page.url.lower()

    # Check for success indicators
    success_indicators = [
        "/admin/collections" in current_url,
        "/admin/dashboard" in current_url,
        current_url.rstrip("/") == f"{base_url}/admin".lower(),
        "/admin/" in current_url and "/login" not in current_url,
    ]

    # Check if we have auth token
    has_token = False
    try:
        token = page.evaluate("localStorage.getItem('payload-token')")
        has_token = bool(token)
    except Exception:
        pass

    if not any(success_indicators) and not has_token:
        # Fallback: autentica via API e injeta token no localStorage.
        try:
            api_login = requests.post(
                f"{base_url}/api/users/login",
                json={
                    "email": credentials["email"],
                    "password": credentials["password"],
                },
                timeout=15,
            )
            api_data = api_login.json() if api_login.content else {}
            token = api_data.get("token")
            if api_login.status_code == 200 and token:
                page.goto(base_url)
                page.evaluate(
                    "(payloadToken) => localStorage.setItem('payload-token', payloadToken)",
                    token,
                )
                page.goto(admin_url)
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(1500)

                current_url = page.url.lower()
                success_indicators = [
                    "/admin/collections" in current_url,
                    "/admin/dashboard" in current_url,
                    current_url.rstrip("/") == f"{base_url}/admin".lower(),
                    "/admin/" in current_url and "/login" not in current_url,
                ]
                try:
                    has_token = bool(page.evaluate("localStorage.getItem('payload-token')"))
                except Exception:
                    has_token = False
        except Exception:
            pass

    assert any(success_indicators) or has_token, f"Login failed, still at login page: {page.url}"


# =============================================================================
# SESSION MANAGEMENT
# =============================================================================

def create_authenticated_context(
    browser,
    base_url: str = "http://localhost:3000",
    credentials: Optional[Dict[str, str]] = None
) -> BrowserContext:
    """
    Create a browser context with authenticated session.

    This is useful for running multiple tests with the same authentication
    without re-logging in each time.

    Args:
        browser: Playwright Browser instance
        base_url: Base URL of the application
        credentials: Dict with 'email' and 'password' keys (optional)

    Returns:
        Authenticated BrowserContext
    """
    context = browser.new_context()
    page = context.new_page()

    try:
        _perform_login(page, base_url, credentials or DEFAULT_ADMIN_CREDENTIALS)

        # Save storage state (includes cookies, localStorage, etc.)
        storage_state = context.storage_state()

        # Close and recreate context with saved state
        page.close()
        context.close()

        authenticated_context = browser.new_context(storage_state=storage_state)
        return authenticated_context

    except Exception as e:
        page.close()
        context.close()
        raise e


def save_storage_state(
    context: BrowserContext,
    path: str = "auth-state.json"
) -> None:
    """
    Save the storage state of an authenticated context to a file.

    Args:
        context: Authenticated BrowserContext
        path: Path to save the storage state JSON file
    """
    context.storage_state(path=path)


def load_storage_state(
    browser,
    path: str = "auth-state.json"
) -> BrowserContext:
    """
    Load a previously saved storage state to create an authenticated context.

    Args:
        browser: Playwright Browser instance
        path: Path to the saved storage state JSON file

    Returns:
        Authenticated BrowserContext

    Raises:
        FileNotFoundError: If the storage state file doesn't exist
    """
    from pathlib import Path

    if not Path(path).exists():
        raise FileNotFoundError(f"Storage state file not found: {path}")

    return browser.new_context(storage_state=path)


# =============================================================================
# TOKEN HELPERS (API Authentication)
# =============================================================================

def get_auth_token(
    base_url: str = "http://localhost:3000",
    credentials: Optional[Dict[str, str]] = None
) -> str:
    """
    Get JWT authentication token via API.

    Useful for tests that need to make authenticated API requests
    outside of browser context.

    Args:
        base_url: Base URL of the application
        credentials: Dict with 'email' and 'password' keys (optional)

    Returns:
        JWT token string

    Raises:
        AssertionError: If login fails
    """
    import requests

    creds = credentials or DEFAULT_ADMIN_CREDENTIALS

    response = requests.post(
        f"{base_url}/api/users/login",
        json={
            "email": creds["email"],
            "password": creds["password"],
        },
        timeout=30,
    )

    assert response.status_code == 200, (
        f"Failed to get auth token: {response.text}"
    )

    data = response.json()
    assert "token" in data, "Login response doesn't contain token"

    return data["token"]


def set_auth_token_in_browser(
    page: Page,
    token: str,
    base_url: str = "http://localhost:3000"
) -> None:
    """
    Manually set authentication token in browser localStorage.

    This bypasses the UI login flow for faster test setup.

    Args:
        page: Playwright Page instance
        token: JWT token to set
        base_url: Base URL of the application
    """
    page.goto(base_url)

    # Set token in localStorage
    page.evaluate(f"localStorage.setItem('payload-token', '{token}')")

    # Reload to apply authentication
    page.reload()


# =============================================================================
# VERIFICATION HELPERS
# =============================================================================

def is_authenticated(page: Page) -> bool:
    """
    Check if the current page is authenticated.

    Args:
        page: Playwright Page instance

    Returns:
        True if authenticated, False otherwise
    """
    # Check for auth token in localStorage
    token = page.evaluate("localStorage.getItem('payload-token')")

    if not token:
        return False

    # Check if we're not on login page
    return "/admin/login" not in page.url.lower()


def logout(page: Page, base_url: str = "http://localhost:3000") -> None:
    """
    Log out from the admin panel.

    Args:
        page: Playwright Page instance
        base_url: Base URL of the application
    """
    # Navigate directly to logout endpoint.
    # This avoids flaky click interception from dev overlays.
    page.goto(f"{base_url}/admin/logout")
    page.wait_for_load_state("networkidle")

    # Clear localStorage
    page.evaluate("localStorage.clear()")
