"""
Base Page Object for E2E Tests

Provides common functionality for all page objects.
"""

from typing import Optional
from playwright.sync_api import Page, Locator


class BasePage:
    """Base page object with common methods."""

    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        """
        Initialize base page.

        Args:
            page: Playwright Page instance
            base_url: Base URL of the application
        """
        self.page = page
        self.base_url = base_url

    def goto(self, path: str = "") -> None:
        """
        Navigate to a path.

        Args:
            path: Path to navigate to (e.g., '/imoveis')
        """
        url = f"{self.base_url}{path}" if path else self.base_url
        # networkidle can be flaky with dev overlays/websockets.
        self.page.goto(url, wait_until="domcontentloaded", timeout=60000)
        try:
            self.page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            self.page.wait_for_load_state("load", timeout=10000)

    def wait_for_content_visible(self, selector: str, timeout: int = 5000) -> Locator:
        """
        Wait for an element to be visible.

        Args:
            selector: CSS selector
            timeout: Timeout in milliseconds

        Returns:
            Locator for the element
        """
        locator = self.page.locator(selector)
        locator.wait_for(state="visible", timeout=timeout)
        return locator

    def get_text_content(self, selector: str) -> str:
        """
        Get text content of an element.

        Args:
            selector: CSS selector

        Returns:
            Text content
        """
        return self.page.locator(selector).text_content()

    def is_visible(self, selector: str) -> bool:
        """
        Check if element is visible.

        Args:
            selector: CSS selector

        Returns:
            True if visible, False otherwise
        """
        return self.page.locator(selector).is_visible()

    def click_button(self, name: str, exact: bool = True) -> None:
        """
        Click a button by role.

        Args:
            name: Button text/name
            exact: Whether to match exact text
        """
        self.page.get_by_role("button", name=name, exact=exact).click()

    def fill_input(self, label: str, value: str) -> None:
        """
        Fill an input by label.

        Args:
            label: Input label
            value: Value to fill
        """
        self.page.get_by_label(label).fill(value)

    def select_option(self, label: str, value: str) -> None:
        """
        Select an option from a select by label.

        Args:
            label: Select label
            value: Option value to select
        """
        self.page.get_by_label(label).select_option(value)

    def wait_for_timeout(self, milliseconds: int) -> None:
        """
        Wait for a specified time.

        Args:
            milliseconds: Time to wait in milliseconds
        """
        self.page.wait_for_timeout(milliseconds)

    def take_screenshot(self, path: str, full_page: bool = False) -> None:
        """
        Take a screenshot.

        Args:
            path: Path to save screenshot
            full_page: Whether to capture full page
        """
        self.page.screenshot(path=path, full_page=full_page)

    def get_url(self) -> str:
        """Get current page URL."""
        return self.page.url

    def reload(self) -> None:
        """Reload the current page."""
        self.page.reload(wait_until="domcontentloaded")
        try:
            self.page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            self.page.wait_for_load_state("load", timeout=10000)
