"""
Contact Form Page Object

Represents the contact form functionality on property detail pages.
"""

from playwright.sync_api import Page, Locator
from .base_page import BasePage


class ContactFormPage(BasePage):
    """Page object for contact form functionality."""

    # Selectors
    CONTACT_FORM = "form"
    INPUT_NAME = "#name, input[id='name'], input[name='name']"
    INPUT_EMAIL = "input[type='email'], input[name='email']"
    INPUT_PHONE = "input[type='tel'], input[name='phone']"
    TEXTAREA_MESSAGE = "textarea, textarea[name='message']"
    BUTTON_SUBMIT = "button[type='submit']"
    ERROR_MESSAGE = "[data-testid='form-error'], .error, .error-message"
    SUCCESS_MESSAGE = "[data-testid='form-success'], .success, .success-message"

    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        """
        Initialize contact form page.

        Args:
            page: Playwright Page instance
            base_url: Base URL of the application
        """
        super().__init__(page, base_url)

    def goto_property_with_form(self, slug: str) -> None:
        """
        Navigate to a property page that has a contact form.

        Args:
            slug: Property slug
        """
        self.goto(f"/imoveis/{slug}")
        self.wait_for_timeout(1000)

    def is_form_visible(self) -> bool:
        """
        Check if contact form is visible.

        Returns:
            True if form is visible
        """
        return self.page.locator(self.CONTACT_FORM).count() > 0

    def get_name_input(self) -> Locator:
        """Get name input field."""
        return self.page.locator(self.INPUT_NAME).first

    def get_email_input(self) -> Locator:
        """Get email input field."""
        return self.page.locator(self.INPUT_EMAIL).first

    def get_phone_input(self) -> Locator:
        """Get phone input field (optional)."""
        return self.page.locator(self.INPUT_PHONE).first

    def get_message_input(self) -> Locator:
        """Get message textarea field."""
        return self.page.locator(self.TEXTAREA_MESSAGE).first

    def get_submit_button(self) -> Locator:
        """Get submit button."""
        return self.page.locator(self.BUTTON_SUBMIT).first

    def fill_name(self, name: str) -> None:
        """
        Fill name field.

        Args:
            name: Name value
        """
        input_field = self.get_name_input()
        if input_field.is_visible():
            input_field.fill(name)

    def fill_email(self, email: str) -> None:
        """
        Fill email field.

        Args:
            email: Email value
        """
        input_field = self.get_email_input()
        if input_field.is_visible():
            input_field.fill(email)

    def fill_phone(self, phone: str) -> None:
        """
        Fill phone field.

        Args:
            phone: Phone value
        """
        input_field = self.get_phone_input()
        if input_field.is_visible():
            input_field.fill(phone)

    def fill_message(self, message: str) -> None:
        """
        Fill message field.

        Args:
            message: Message value
        """
        textarea = self.get_message_input()
        if textarea.is_visible():
            textarea.fill(message)

    def fill_form(
        self,
        name: str,
        email: str,
        phone: str = "",
        message: str = ""
    ) -> None:
        """
        Fill all form fields.

        Args:
            name: Name value (required)
            email: Email value (required)
            phone: Phone value (optional)
            message: Message value (optional)
        """
        self.fill_name(name)
        self.fill_email(email)
        if phone:
            self.fill_phone(phone)
        if message:
            self.fill_message(message)

    def submit_form(self) -> None:
        """Submit the contact form."""
        submit_btn = self.get_submit_button()
        if submit_btn.is_visible():
            submit_btn.click()
            self.wait_for_timeout(1000)

    def has_error_message(self) -> bool:
        """
        Check if error message is displayed.

        Returns:
            True if error message is visible
        """
        error_locator = self.page.locator(self.ERROR_MESSAGE)
        # Also check for HTML5 validation messages
        return (
            error_locator.count() > 0 and error_locator.first.is_visible()
        ) or self._has_validation_errors()

    def _has_validation_errors(self) -> bool:
        """
        Check if HTML5 validation errors are present.

        Returns:
            True if validation errors are present
        """
        # Check if email input is invalid
        email_input = self.get_email_input()
        if email_input.is_visible():
            is_valid = email_input.evaluate(
                "el => el.checkValidity()"
            )
            if not is_valid:
                return True

        # Check if name input is required and empty
        name_input = self.get_name_input()
        if name_input.is_visible():
            is_required = name_input.evaluate(
                "el => el.required"
            )
            value = name_input.input_value()
            if is_required and not value:
                return True

        return False

    def get_error_message_text(self) -> str:
        """
        Get error message text.

        Returns:
            Error message text
        """
        error_locator = self.page.locator(
            "text=/obrigatório|required/i"
        ).or_(
            self.page.locator("text=/inválido|invalid/i")
        ).or_(
            self.page.locator("text=/preenchido|fill/i")
        )

        if error_locator.count() > 0:
            return error_locator.first.text_content() or ""
        return ""

    def has_success_message(self) -> bool:
        """
        Check if success message is displayed.

        Returns:
            True if success message is visible
        """
        success_locator = self.page.locator(
            "text=/enviado|enviada|sucesso|success/i"
        ).or_(
            self.page.locator(self.SUCCESS_MESSAGE)
        )

        return (
            success_locator.count() > 0 and
            success_locator.first.is_visible()
        )

    def get_success_message_text(self) -> str:
        """
        Get success message text.

        Returns:
            Success message text
        """
        success_locator = self.page.locator(
            "text=/enviado com sucesso|mensagem enviada/i"
        )

        if success_locator.count() > 0 and success_locator.first.is_visible():
            return success_locator.first.text_content() or ""
        return ""

    def is_submit_button_disabled(self) -> bool:
        """
        Check if submit button is disabled.

        Returns:
            True if button is disabled
        """
        submit_btn = self.get_submit_button()
        if submit_btn.is_visible():
            return submit_btn.is_disabled()
        return False

    def clear_form(self) -> None:
        """Clear all form fields."""
        fields = [
            self.get_name_input(),
            self.get_email_input(),
            self.get_phone_input(),
            self.get_message_input()
        ]

        for field in fields:
            if field.is_visible():
                field.fill("")
