"""
Pytest conftest for E2E tests.

Provides fixtures for Playwright browser, pages, and test configuration.
"""

import os
from typing import Generator
from pathlib import Path

import pytest
from playwright.sync_api import Browser, BrowserContext, Page


# =============================================================================
# BASE URL FIXTURE
# =============================================================================

@pytest.fixture(scope="session")
def base_url() -> str:
    """
    Base URL for the application.

    Reads from environment variable or defaults to localhost:3002 (Payload CMS).
    """
    return os.getenv(
        "E2E_BASE_URL",
        "http://localhost:3000"
    )


# =============================================================================
# PLAYWRIGHT FIXTURES
# =============================================================================

@pytest.fixture(scope="function")
def page(browser: Browser) -> Generator[Page, None, None]:
    """
    Playwright Page fixture.

    Provides a new page instance for each test.

    Args:
        browser: Playwright Browser fixture from pytest-playwright

    Yields:
        Page instance
    """
    page = browser.new_page()

    # Cleanup any open dropdowns/modals before starting test
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(100)
        page.evaluate("() => { document.body.click() }")
        page.wait_for_timeout(100)
    except Exception:
        pass

    yield page

    # Cleanup after test - close any open modals/dropdowns
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(100)
    except Exception:
        pass

    page.close()


@pytest.fixture(scope="function")
def context(browser: Browser) -> Generator[BrowserContext, None, None]:
    """
    Playwright BrowserContext fixture.

    Provides a new browser context for each test.

    Args:
        browser: Playwright Browser fixture from pytest-playwright

    Yields:
        BrowserContext instance
    """
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        locale="pt-BR",
    )
    yield context
    context.close()


# =============================================================================
# SCREENSHOT FIXTURE (for failures)
# =============================================================================

@pytest.fixture(autouse=True)
def screenshot_on_failure(
    request: pytest.FixtureRequest,
    page: Page
) -> Generator[None, None, None]:
    """
    Automatically take screenshot on test failure.

    Args:
        request: Pytest request fixture
        page: Playwright Page fixture

    Yields:
        None
    """
    yield

    # Check if test failed - handle missing rep_call attribute
    if hasattr(request.node, 'rep_call') and request.node.rep_call.failed:  # type: ignore
        try:
            # Create screenshots directory if it doesn't exist
            screenshot_dir = Path(__file__).parent / "screenshots"
            screenshot_dir.mkdir(exist_ok=True)

            # Generate screenshot filename
            test_name = request.node.name.replace("/", "_").replace("\\", "_")
            screenshot_path = screenshot_dir / f"{test_name}-failed.png"

            # Take screenshot
            page.screenshot(path=str(screenshot_path), full_page=True)
        except Exception:
            # Ignore screenshot errors
            pass


# =============================================================================
# PYTEST HOOKS
# =============================================================================

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item):  # type: ignore
    """
    Pytest hook to attach test report to node for screenshot fixture.

    Args:
        item: Test item

    Yields:
        Test report
    """
    # Execute all other hooks to obtain the report object
    outcome = yield
    rep = outcome.get_result()

    # Set a report attribute for each phase of a call
    setattr(item, "rep_" + rep.when, rep)
