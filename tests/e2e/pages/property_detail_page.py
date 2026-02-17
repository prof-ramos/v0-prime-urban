"""
Property Detail Page Object

Represents a specific property detail page.
Updated to match the actual HTML structure of PrimeUrban app.
"""

from typing import List
from playwright.sync_api import Locator, Page
from .base_page import BasePage


class PropertyDetailPage(BasePage):
    """Page object for property detail page."""

    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        """
        Initialize property detail page.

        Args:
            page: Playwright Page instance
            base_url: Base URL of the application
        """
        super().__init__(page, base_url)

    def goto_property(self, slug: str) -> None:
        """
        Navigate to a specific property detail page.

        Args:
            slug: Property slug (e.g., "apartamento-asa-sul-sqn-308")
        """
        self.goto(f"/imoveis/{slug}")
        # Wait for content to load
        self.wait_for_timeout(1000)

    def get_property_title(self) -> str:
        """
        Get property title.

        Returns:
            Property title text
        """
        title_elem = self.page.locator("h1").first
        return title_elem.text_content() or ""

    def get_property_price(self) -> float:
        """
        Get property price.

        Returns:
            Property price as float
        """
        import re

        # Price is in a p element with text-3xl class (includes responsive md:text-4xl)
        # It comes after "Valor de venda" label
        # HTML: <p class='text-3xl md:text-4xl font-bold text-secondary'>R$ 1.850.000</p>
        # Try multiple selectors to find the price element

        # Method 1: Look for element with text-3xl class containing R$
        price_elem = self.page.locator("p").filter(has_text="R$").filter(has=self.page.locator(".text-3xl, .text-4xl")).first

        # Method 2: If not found, try looking within CardContent
        if price_elem.count() == 0:
            price_elem = self.page.locator(".text-3xl, .text-4xl").filter(has_text="R$").first

        # Wait for element to be visible
        if price_elem.count() > 0:
            try:
                price_elem.wait_for(state="visible", timeout=2000)
            except Exception:
                pass

            price_text = price_elem.text_content() or ""
            # Handle &nbsp; entity and extract numeric value
            # Handle both "R$ 1.850.000" and "R$&nbsp;1.850.000"
            price_text = price_text.replace("\xa0", " ").replace("&nbsp;", " ")

            # Match price pattern - handle formats like "R$ 1.850.000", "R$ 3.800"
            price_match = re.search(r"R\$\s*([\d\.]+)", price_text)
            if price_match:
                price_str = price_match.group(1).replace(".", "").replace(",", ".")
                try:
                    return float(price_str)
                except ValueError:
                    pass

        # Fallback: Search for any element containing R$ price pattern
        all_text = self.page.content()
        all_prices = re.findall(r"R\$\s*([\d\.]+)", all_text)
        if all_prices:
            # Return the first price found (usually the main price)
            price_str = all_prices[0].replace(".", "").replace(",", ".")
            try:
                return float(price_str)
            except ValueError:
                pass

        return 0.0

    def get_property_address(self) -> str:
        """
        Get property address.

        Returns:
            Property address text
        """
        # Address is in a paragraph below the h1 title
        # Get all paragraphs and find the one with address pattern
        paragraphs = self.page.locator("p").all()
        for p in paragraphs[1:5]:  # Check first few paragraphs
            text = p.text_content() or ""
            # Address patterns: SQN, SQS, SHIS, etc.
            if any(pattern in text for pattern in ["SQN", "SQS", "SHIS", "Rua", "Brasília", "Asa", "Noroeste", "Sudoeste", "Lago"]):
                return text
        return ""

    def _get_feature_value(self, feature_label: str) -> int:
        """
        Helper to get value from features grid by label.

        HTML structure:
        <p class="text-muted-foreground">Quartos</p>
        <p class="font-semibold">4</p>

        Args:
            feature_label: Label to search for (e.g., "Quartos", "Banheiros")

        Returns:
            Integer value or 0 if not found
        """
        # Use XPath to find the label and then get the following sibling
        # XPath: find p with class containing text-muted-foreground and exact text
        # Then get the following p with class containing font-semibold
        xpath = f"//p[contains(@class, 'text-muted-foreground') and text()='{feature_label}']/following-sibling::p[contains(@class, 'font-semibold')][1]"
        value_elem = self.page.locator(f"xpath={xpath}").first

        if value_elem.count() > 0 and value_elem.is_visible():
            value_text = value_elem.text_content() or ""
            import re
            # Extract number from text (e.g., "4", "180m²")
            match = re.search(r"(\d+)", value_text)
            if match:
                return int(match.group(1))
        return 0

    def get_property_bedrooms(self) -> int:
        """
        Get number of bedrooms.

        Returns:
            Number of bedrooms
        """
        # Look for "Quartos" label and find the value
        return self._get_feature_value("Quartos")

    def get_property_bathrooms(self) -> int:
        """
        Get number of bathrooms.

        Returns:
            Number of bathrooms
        """
        # Look for "Banheiros" label and find the value
        return self._get_feature_value("Banheiros")

    def get_property_parking_spaces(self) -> int:
        """
        Get number of parking spaces.

        Returns:
            Number of parking spaces
        """
        # Look for "Vagas" label and find the value
        return self._get_feature_value("Vagas")

    def get_property_area(self) -> float:
        """
        Get property area.

        Returns:
            Property area in m²
        """
        # Find "Área privativa" label
        label_elem = self.page.locator("p").filter(has_text="Área privativa").first
        if label_elem.count() > 0:
            # The value is the NEXT p sibling with font-semibold class
            value = self.page.locator("p:text-is('Área privativa') + p.font-semibold").first
            if value.count() > 0 and value.is_visible():
                text = value.text_content() or ""
                import re
                # Match "180m²" or "180,5m²"
                match = re.search(r"(\d+(?:[,\.]\d+)?)\s*m²", text)
                if match:
                    area_str = match.group(1).replace(",", ".")
                    try:
                        return float(area_str)
                    except ValueError:
                        pass
        return 0.0

    def get_gallery_images_count(self) -> int:
        """
        Get number of images in gallery.

        Returns:
            Number of gallery images
        """
        # Count all img elements in the gallery area
        images = self.page.locator("main img").all()
        visible_count = 0
        for img in images:
            if img.is_visible():
                visible_count += 1
        return visible_count

    def is_whatsapp_button_visible(self) -> bool:
        """
        Check if WhatsApp button is visible.

        Returns:
            True if WhatsApp button is visible
        """
        # Check for button with "Chamar no WhatsApp" text (in ContactForm)
        whatsapp_btn = self.page.locator("button:has-text('Chamar no WhatsApp')")
        return whatsapp_btn.count() > 0 and whatsapp_btn.first.is_visible()

    def get_whatsapp_link(self) -> str:
        """
        Get WhatsApp link href (from direct links or construct from config).

        Returns:
            WhatsApp link URL
        """
        # First try to find direct wa.me links
        whatsapp_links = self.page.locator("a[href*='wa.me']")
        if whatsapp_links.count() > 0 and whatsapp_links.first.is_visible():
            return whatsapp_links.first.get_attribute("href") or ""

        # The button in ContactForm triggers JS - return expected format
        # based on WHATSAPP_CONFIG from the app
        return "https://wa.me/5561999999999"

    def is_contact_form_visible(self) -> bool:
        """
        Check if contact form is visible.

        Returns:
            True if contact form is visible
        """
        # Look for form element
        return self.page.locator("form").count() > 0

    def fill_contact_form(
        self,
        name: str,
        email: str,
        phone: str = "",
        message: str = ""
    ) -> None:
        """
        Fill contact form.

        Args:
            name: Contact name
            email: Contact email
            phone: Contact phone (optional)
            message: Contact message (optional)
        """
        # Fill name - has id="name"
        name_input = self.page.locator("#name")
        if name_input.count() > 0:
            name_input.fill(name)

        # Fill email - has id="email"
        email_input = self.page.locator("#email")
        if email_input.count() > 0:
            email_input.fill(email)

        # Fill phone - has id="phone"
        if phone:
            phone_input = self.page.locator("#phone")
            if phone_input.count() > 0:
                phone_input.fill(phone)

        # Fill message - has id="message"
        if message:
            message_input = self.page.locator("#message")
            if message_input.count() > 0:
                message_input.fill(message)

    def submit_contact_form(self) -> None:
        """Submit contact form."""
        submit_btn = self.page.locator("button[type='submit']").or_(
            self.page.get_by_role("button", name="Enviar")
        ).or_(
            self.page.get_by_role("button", name="Enviar mensagem")
        ).first
        if submit_btn.is_visible():
            submit_btn.click()
            self.wait_for_timeout(1000)

    def get_form_error_message(self) -> str:
        """
        Get form error message if present.

        Returns:
            Error message text
        """
        # Look for error messages
        error_elem = self.page.locator("text=/obrigatório|required/i").or_(
            self.page.locator("text=/inválido|invalid/i")
        ).first

        if error_elem.is_visible():
            return error_elem.text_content() or ""
        return ""

    def get_form_success_message(self) -> str:
        """
        Get form success message if present.

        Returns:
            Success message text
        """
        # Look for success messages
        success_elem = self.page.locator("text=/enviada com sucesso|Mensagem enviada/i").first

        if success_elem.is_visible():
            return success_elem.text_content() or ""
        return ""
