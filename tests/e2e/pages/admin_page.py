"""
Admin Page Object for Payload CMS

Provides Page Object for Payload CMS admin panel interactions.
"""

from typing import Optional, List
from playwright.sync_api import Page, Locator, expect
from tests.e2e.pages.base_page import BasePage


class AdminPage(BasePage):
    """Page Object for Payload CMS Admin panel."""

    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        """
        Initialize admin page.

        Args:
            page: Playwright Page instance
            base_url: Base URL of the application
        """
        super().__init__(page, base_url)
        self.admin_path = "/admin"
        self.collections_path = f"{self.admin_path}/collections"

    # =============================================================================
    # NAVIGATION
    # =============================================================================

    def goto_admin(self) -> None:
        """Navigate to admin panel."""
        self.goto(self.admin_path)

    def goto_collection(self, collection_slug: str) -> None:
        """
        Navigate to a specific collection.

        Args:
            collection_slug: Collection slug (e.g., 'properties', 'leads', 'users')
        """
        self.goto(f"{self.collections_path}/{collection_slug}")

    def goto_create_new(self, collection_slug: str) -> None:
        """
        Navigate to create new document page.

        Args:
            collection_slug: Collection slug
        """
        self.goto(f"{self.collections_path}/{collection_slug}/create")

    def goto_edit_document(self, collection_slug: str, doc_id: str) -> None:
        """
        Navigate to edit document page.

        Args:
            collection_slug: Collection slug
            doc_id: Document ID
        """
        self.goto(f"{self.collections_path}/{collection_slug}/{doc_id}")

    # =============================================================================
    # LOGIN
    # =============================================================================

    def is_logged_in(self) -> bool:
        """
        Check if user is logged in.

        Returns:
            True if logged in, False otherwise
        """
        current_url = self.get_url().lower()

        # Login page is always unauthenticated
        if "/admin/login" in current_url:
            return False

        # Explicit token authentication
        try:
            token = self.page.evaluate("localStorage.getItem('payload-token')")
            if token:
                return True
        except Exception:
            pass

        # Payload dev auto-login may not populate localStorage; validate via UI markers
        has_collections_nav = self.page.locator('a[href*="/admin/collections/"]').count() > 0
        has_login_form = self.page.locator('input[type="email"]').count() > 0 and self.page.locator('input[type="password"]').count() > 0

        return has_collections_nav and not has_login_form

    def wait_for_dashboard(self, timeout: int = 10000) -> None:
        """
        Wait for dashboard to load after login.

        Args:
            timeout: Timeout in milliseconds
        """
        # Wait for either dashboard or a collection list to appear
        self.page.wait_for_function(
            """() => {
                return document.querySelector('[data-testid="dashboard"]') !== null ||
                       document.querySelector('.collection-list') !== null ||
                       document.querySelector('[class*="dashboard"]') !== null ||
                       window.location.pathname.includes('/collections');
            }""",
            timeout=timeout
        )

    # =============================================================================
    # SIDEBAR NAVIGATION
    # =============================================================================

    def get_collections_in_sidebar(self) -> List[str]:
        """
        Get list of collection names from sidebar.

        Returns:
            List of collection slugs/names
        """
        links = self.page.locator('nav a[href*="/admin/collections/"]')
        if links.count() == 0:
            links = self.page.locator('a[href*="/admin/collections/"]')

        hrefs = links.evaluate_all("els => els.map(e => e.getAttribute('href')).filter(Boolean)")
        unique_hrefs = []
        for href in hrefs:
            if href not in unique_hrefs:
                unique_hrefs.append(href)
        return unique_hrefs

    def click_sidebar_collection(self, collection_name: str) -> None:
        """
        Click a collection in the sidebar.

        Args:
            collection_name: Collection name to click
        """
        # Try multiple selectors for collection links
        self.page.get_by_role('link', name=collection_name, exact=True).click()
        self.page.wait_for_load_state('networkidle')

    # =============================================================================
    # LIST VIEW
    # =============================================================================

    def get_table_row_count(self) -> int:
        """
        Get number of rows in the collection list table.

        Returns:
            Number of rows
        """
        table_selectors = [
            'table tbody tr',
            '[class*="List"][class*="table"] tr',
            '[role="table"] tbody tr',
            '[data-testid="collection-list"] tr',
        ]

        for selector in table_selectors:
            rows = self.page.locator(selector)
            if rows.count() > 0:
                return rows.count()

        return 0

    def get_cell_text(self, row_index: int, col_index: int) -> str:
        """
        Get text from a specific table cell.

        Args:
            row_index: Row index (0-based)
            col_index: Column index (0-based)

        Returns:
            Cell text content
        """
        cell = self.page.locator(f'table tbody tr:nth-child({row_index + 1}) td:nth-child({col_index + 1})')
        return cell.text_content() or ''

    def click_row(self, row_index: int) -> None:
        """
        Click a row in the table to navigate to edit.

        Args:
            row_index: Row index (0-based)
        """
        row = self.page.locator(f'table tbody tr:nth-child({row_index + 1})')
        row_link = row.locator('a[href*="/admin/collections/"]').first

        if row_link.count() > 0:
            row_link.click()
        else:
            row.click()

        self.page.wait_for_load_state('networkidle')

    def click_edit_button(self, row_index: int = 0) -> None:
        """
        Click the edit button for a row.

        Args:
            row_index: Row index (0-based)
        """
        edit_selectors = [
            'button[aria-label="Edit"]',
            'button[title="Edit"]',
            'a[aria-label="Edit"]',
            '[class*="edit"]',
        ]

        for selector in edit_selectors:
            button = self.page.locator(
                f'table tbody tr:nth-child({row_index + 1}) {selector}'
            ).first
            if button.is_visible():
                button.click()
                self.page.wait_for_load_state('networkidle')
                return

        # Fallback: click the row itself
        self.click_row(row_index)

    # =============================================================================
    # CREATE/EDIT FORM
    # =============================================================================

    def fill_field(self, label: str, value: str) -> None:
        """
        Fill a field by its label.

        Args:
            label: Field label
            value: Value to fill
        """
        # Try to find input by label
        input_locator = (
            self.page.get_by_label(label, exact=False)
            .or_(self.page.locator(f'[data-label="{label}"] input'))
            .or_(self.page.locator(f'label:has-text("{label}") + input'))
            .or_(self.page.locator(f'[placeholder="{label}"]'))
            .first
        )

        input_locator.fill(value)

    def fill_textarea(self, label: str, value: str) -> None:
        """
        Fill a textarea by its label.

        Args:
            label: Field label
            value: Value to fill
        """
        textarea = (
            self.page.get_by_label(label, exact=False)
            .or_(self.page.locator(f'label:has-text("{label}") + textarea'))
            .first
        )

        textarea.fill(value)

    def select_dropdown_option(self, label: str, value: str) -> None:
        """
        Select an option from a dropdown.

        Args:
            label: Field label
            value: Option value to select
        """
        select = (
            self.page.get_by_label(label, exact=False)
            .or_(self.page.locator('select'))
            .first
        )

        select.select_option(value)

    def toggle_checkbox(self, label: str, checked: bool = True) -> None:
        """
        Toggle a checkbox.

        Args:
            label: Field label
            checked: Whether to check or uncheck
        """
        checkbox = (
            self.page.get_by_label(label, exact=False)
            .or_(self.page.locator(f'[type="checkbox"]'))
            .first
        )

        if checked and not checkbox.is_checked():
            checkbox.check()
        elif not checked and checkbox.is_checked():
            checkbox.uncheck()

    # =============================================================================
    # FORM ACTIONS
    # =============================================================================

    def click_save(self) -> None:
        """Click the save button."""
        save_selectors = [
            'button[type="submit"]',
            'button:has-text("Save")',
            'button:has-text("Salvar")',
            '[data-testid="save-button"]',
            '[class*="save"][class*="button"]',
        ]

        for selector in save_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

        raise AssertionError("Could not find save button")

    def click_cancel(self) -> None:
        """Click the cancel button."""
        cancel_selectors = [
            'button:has-text("Cancel")',
            'button:has-text("Cancelar")',
            'button:has-text("Voltar")',
            'a:has-text("Cancel")',
            'a:has-text("Voltar")',
            'a[href*="/admin/collections/"]',
            '[data-testid="cancel-button"]',
        ]

        for selector in cancel_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

    def wait_for_save_success(self, timeout: int = 5000) -> None:
        """
        Wait for save success notification.

        Args:
            timeout: Timeout in milliseconds
        """
        success_selectors = [
            '[data-testid="save-success"]',
            '[class*="success"][class*="toast"]',
            '[role="alert"]:has-text("saved")',
            '[role="alert"]:has-text("salvo")',
        ]

        for selector in success_selectors:
            try:
                self.page.locator(selector).wait_for(state='visible', timeout=timeout)
                return
            except Exception:
                continue

    # =============================================================================
    # DELETE
    # =============================================================================

    def click_delete(self) -> None:
        """Click the delete button."""
        delete_selectors = [
            'button:has-text("Delete")',
            'button:has-text("Deletar")',
            'button:has-text("Excluir")',
            '[data-testid="delete-button"]',
            '[aria-label="Delete"]',
        ]

        for selector in delete_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

    def confirm_delete(self) -> None:
        """Confirm delete in modal/dialog."""
        confirm_selectors = [
            'button:has-text("Confirm")',
            'button:has-text("Delete")',
            'button:has-text("Confirmar")',
            '[data-testid="confirm-delete"]',
        ]

        for selector in confirm_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

    # =============================================================================
    # LOGOUT
    # =============================================================================

    def click_user_menu(self) -> None:
        """Click user menu button."""
        menu_selectors = [
            'button[aria-label="User menu"]',
            'button[aria-label="Menu"]',
            '[class*="user"][class*="menu"]',
            '[data-testid="user-menu"]',
        ]

        for selector in menu_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

    def click_logout(self) -> None:
        """Click logout button."""
        logout_selectors = [
            'button:has-text("Logout")',
            'button:has-text("Sair")',
            'a:has-text("Logout")',
            'a[href="/admin/logout"]',
            '[data-testid="logout"]',
            '[aria-label="Logout"]',
        ]

        for selector in logout_selectors:
            button = self.page.locator(selector).first
            if button.is_visible():
                button.click()
                return

    def logout(self) -> None:
        """Perform logout flow."""
        self.click_user_menu()
        self.page.wait_for_timeout(500)  # Wait for menu animation
        self.click_logout()
        self.page.wait_for_load_state('networkidle')

    # =============================================================================
    # VERIFICATION
    # =============================================================================

    def is_on_login_page(self) -> bool:
        """
        Check if currently on login page.

        Returns:
            True if on login page
        """
        return '/login' in self.get_url().lower() or self.is_visible('input[type="email"]')

    def is_on_collection_list(self, collection_slug: str) -> bool:
        """
        Check if on collection list page.

        Args:
            collection_slug: Collection slug

        Returns:
            True if on collection list page
        """
        url = self.get_url()
        return f'/collections/{collection_slug}' in url

    def is_on_edit_page(self, collection_slug: str, doc_id: Optional[str] = None) -> bool:
        """
        Check if on edit page.

        Args:
            collection_slug: Collection slug
            doc_id: Optional document ID

        Returns:
            True if on edit page
        """
        url = self.get_url()
        has_collection = f'/collections/{collection_slug}/' in url
        has_id = doc_id is None or doc_id in url
        return has_collection and has_id and '/create' not in url

    def is_on_create_page(self, collection_slug: str) -> bool:
        """
        Check if on create page.

        Args:
            collection_slug: Collection slug

        Returns:
            True if on create page
        """
        return f'/collections/{collection_slug}/create' in self.get_url()

    def has_error_message(self) -> bool:
        """
        Check if there's an error message displayed.

        Returns:
            True if error message is visible
        """
        error_selectors = [
            '[data-testid="error"]',
            '[class*="error"][class*="message"]',
            '[role="alert"]',
            '.error',
        ]

        for selector in error_selectors:
            if self.is_visible(selector):
                return True

        return False

    def get_error_message(self) -> str:
        """
        Get error message text.

        Returns:
            Error message text or empty string
        """
        error_selectors = [
            '[data-testid="error"]',
            '[class*="error"][class*="message"]',
            '[role="alert"]',
            '.error',
        ]

        for selector in error_selectors:
            locator = self.page.locator(selector).first
            if locator.is_visible():
                return locator.text_content() or ''

        return ''
