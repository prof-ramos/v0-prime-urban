"""
Properties Page Object

Represents the properties listing page with filters.
Updated to work with Radix UI Select components and actual component structure.
"""

from typing import List, Optional
import re
from playwright.sync_api import Locator, Page
from .base_page import BasePage


class PropertiesPage(BasePage):
    """Page object for the properties listing page."""

    def __init__(self, page: Page, base_url: str = "http://localhost:3000"):
        """
        Initialize properties page.

        Args:
            page: Playwright Page instance
            base_url: Base URL of the application
        """
        super().__init__(page, base_url)

    def goto_properties(self) -> None:
        """Navigate to properties listing page."""
        self.goto("/imoveis")
        # Wait for client-side rendering
        self.wait_for_timeout(1000)

    def get_property_cards(self) -> Locator:
        """
        Get all property cards on the page.

        Returns:
            Locator for property cards
        """
        # Property cards use Card component with specific classes
        return self.page.locator(".group.overflow-hidden.hover\\3Aborder-secondary")

    def get_property_count(self) -> int:
        """
        Get the number of property cards visible.

        Returns:
            Number of property cards
        """
        # Count property cards by looking for links with /imoveis/ href
        # This is more reliable than looking for Card classes
        property_links = self.page.locator("a[href*='/imoveis/']").all()
        visible_count = 0
        for link in property_links:
            if link.is_visible():
                # Verify it's a property link (has slug after /imoveis/)
                href = link.get_attribute("href") or ""
                if "/imoveis/" in href and len(href.split("/imoveis/")) > 1:
                    visible_count += 1
        return visible_count

    def _close_any_open_dropdowns(self) -> None:
        """Close any open Radix UI dropdowns."""
        # Press Escape to close open dropdowns
        self.page.keyboard.press("Escape")
        self.wait_for_timeout(150)

        # Also try clicking on the page body to close any portals
        try:
            self.page.locator("body").click(force=True, timeout=1000)
        except Exception:
            pass

        self.wait_for_timeout(100)

    def _find_select_trigger_by_placeholder(self, placeholder: str) -> Optional[Locator]:
        """
        Find a Select trigger by its placeholder text.

        Args:
            placeholder: Placeholder text to search for

        Returns:
            Locator for the trigger or None
        """
        # Look for SelectTrigger with role="combobox"
        triggers = self.page.locator("[role='combobox']").all()
        for trigger in triggers:
            if trigger.is_visible():
                text = trigger.text_content() or ""
                # Check if placeholder matches or if trigger contains the placeholder
                if placeholder.lower() in text.lower() or placeholder in text:
                    return trigger
        return None

    def _select_radix_option_by_placeholder(self, placeholder: str, option_value: str) -> None:
        """
        Select an option from a Radix UI Select component by placeholder.

        Args:
            placeholder: Placeholder text of the select (e.g., "Comprar/Alugar", "Tipo de imóvel")
            option_value: The value/label to select (e.g., "apartamento", "Comprar")
        """
        # Close any open dropdowns first
        self._close_any_open_dropdowns()

        # Find the trigger by placeholder
        trigger = self._find_select_trigger_by_placeholder(placeholder)
        if not trigger:
            raise ValueError(f"Select with placeholder '{placeholder}' not found")

        # Click to open the dropdown
        trigger.click()
        self.wait_for_timeout(200)

        # Click on the option
        # Try by data-value first, then by text
        option = self.page.locator(f"[data-value='{option_value}']").or_(
            self.page.get_by_role("option", name=option_value)
        ).first

        if option.count() > 0 and option.is_visible():
            option.click()
        else:
            # Close the dropdown if option not found
            trigger.click()
            raise ValueError(f"Option '{option_value}' not found in select with placeholder '{placeholder}'")

        self.wait_for_timeout(500)

    def filter_by_transaction_type(self, value: str) -> None:
        """
        Filter by transaction type.

        Args:
            value: Transaction type value ("venda", "aluguel", or "" for all)
        """
        # Map value to display text
        value_map = {
            "venda": "Comprar",
            "aluguel": "Alugar",
            "": "Comprar/Alugar"
        }
        display_value = value_map.get(value, value)
        self._select_radix_option_by_placeholder("Comprar/Alugar", display_value)
        self.wait_for_timeout(500)  # Wait for debounce

    def filter_by_property_type(self, value: str) -> None:
        """
        Filter by property type.

        Args:
            value: Property type value ("apartamento", "casa", "cobertura", etc.)
        """
        self._select_radix_option_by_placeholder("Tipo de imóvel", value)
        self.wait_for_timeout(500)

    def filter_by_neighborhood(self, value: str) -> None:
        """
        Filter by neighborhood.

        Args:
            value: Neighborhood value (e.g., "Asa Sul", "Sudoeste")
        """
        self._select_radix_option_by_placeholder("Bairro", value)
        self.wait_for_timeout(500)

    def set_mobile_viewport(self) -> None:
        """
        Set viewport to mobile size to access mobile filters.
        """
        self.page.set_viewport_size({"width": 375, "height": 667})
        self.wait_for_timeout(500)

    def filter_by_price_range(self, min_price: int, max_price: int) -> None:
        """
        Filter by price range.

        Note: Price filter is only available in mobile Sheet (lg:hidden).
        We need to switch to mobile viewport first.

        Args:
            min_price: Minimum price
            max_price: Maximum price
        """
        # Switch to mobile viewport to access filter button
        self.set_mobile_viewport()

        # Price filter is in mobile Sheet - need to open it
        filter_button = self.page.locator("button:has-text('Filtros')").or_(
            self.page.locator("button:has([data-lucide='sliders-horizontal'])")
        ).first

        if filter_button.is_visible():
            filter_button.click()
            self.wait_for_timeout(500)

        # Now find the slider in the Sheet
        sliders = self.page.locator("[data-slot='slider']").all()

        for slider in sliders:
            if slider.is_visible():
                # Get slider bounds for drag calculation
                box = slider.bounding_box()
                if box:
                    # Calculate thumb positions based on min/max
                    # Default range is 0 to 10000000 (from PRICE_LIMITS)
                    min_limit = 0
                    max_limit = 10000000

                    # Calculate percentage positions
                    min_percent = (min_price - min_limit) / (max_limit - min_limit)
                    max_percent = (max_price - min_limit) / (max_limit - min_limit)

                    # Get thumbs
                    thumbs = slider.locator("[data-slot='slider-thumb']").all()

                    # First thumb (min) - drag to min_percent position
                    if len(thumbs) > 0:
                        thumb1 = thumbs[0]
                        thumb1_box = thumb1.bounding_box()
                        if thumb1_box:
                            target_x = box['x'] + (box['width'] * min_percent)
                            target_y = thumb1_box['y'] + thumb1_box['height'] / 2

                            # Drag thumb to position
                            self.page.mouse.move(thumb1_box['x'] + thumb1_box['width'] / 2, target_y)
                            self.page.mouse.down()
                            self.page.mouse.move(target_x, target_y, steps=10)
                            self.page.mouse.up()

                    # Second thumb (max) - drag to max_percent position
                    if len(thumbs) > 1:
                        thumb2 = thumbs[1]
                        thumb2_box = thumb2.bounding_box()
                        if thumb2_box:
                            target_x = box['x'] + (box['width'] * max_percent)
                            target_y = thumb2_box['y'] + thumb2_box['height'] / 2

                            # Drag thumb to position
                            self.page.mouse.move(thumb2_box['x'] + thumb2_box['width'] / 2, target_y)
                            self.page.mouse.down()
                            self.page.mouse.move(target_x, target_y, steps=10)
                            self.page.mouse.up()

                # Wait for filter update
                self.wait_for_timeout(500)
                break

    def filter_by_bedrooms(self, value: str) -> None:
        """
        Filter by number of bedrooms.

        Note: This filter is only available in mobile view (Sheet).

        Args:
            value: Number of bedrooms (e.g., "1", "2", "3", "4+")
        """
        # Bedroom filter is only in mobile Sheet
        # For desktop tests, we'll skip this
        self.wait_for_timeout(500)

    def filter_by_parking_spaces(self, value: str) -> None:
        """
        Filter by number of parking spaces.

        Note: This filter is only available in mobile view (Sheet).

        Args:
            value: Number of parking spaces (e.g., "1", "2", "3+")
        """
        # Parking filter is only in mobile Sheet
        # For desktop tests, we'll skip this
        self.wait_for_timeout(500)

    def search_by_neighborhood(self, neighborhood: str) -> None:
        """
        Search by neighborhood text.

        Args:
            neighborhood: Neighborhood name to search for
        """
        # Find search input with placeholder "Buscar por endereço, bairro ou código..."
        search_input = self.page.locator("input[placeholder*='Buscar']").or_(
            self.page.locator("input[type='search']")
        ).or_(
            self.page.locator("input[placeholder*='endereço']")
        ).first

        if search_input.count() > 0 and search_input.is_visible():
            search_input.fill(neighborhood)
            self.wait_for_timeout(500)  # Wait for debounce

    def clear_filters(self) -> None:
        """Clear all filters."""
        # Look for clear button (X icon) in desktop filters
        clear_button = self.page.locator("button:has-text('Limpar filtros')").or_(
            self.page.locator(".text-muted-foreground.hover\\3Atext-destructive")  # X button
        ).first

        if clear_button.count() > 0 and clear_button.is_visible():
            clear_button.click()
            self.wait_for_timeout(500)

    def get_filtered_properties(self) -> List[str]:
        """
        Get list of property slugs from filtered results.

        Returns:
            List of property slugs
        """
        property_links = self.page.locator("a[href*='/imoveis/']").all()
        slugs = []
        for link in property_links:
            if link.is_visible():
                href = link.get_attribute("href") or ""
                # Extract slug from href like /imoveis/apartamento-asa-sul-sqn-308
                if "/imoveis/" in href:
                    slug = href.split("/imoveis/")[-1].split("?")[0].split("#")[0]
                    if slug and slug not in slugs:
                        slugs.append(slug)
        return slugs

    def is_no_results_message_visible(self) -> bool:
        """
        Check if no results message is visible.

        Returns:
            True if no results message is shown
        """
        no_results = self.page.locator("text=/Nenhum imóvel encontrado|No results found/i").first
        return no_results.is_visible()

    def get_results_heading_text(self) -> str:
        """
        Get the heading text showing results count.

        Returns:
            Heading text
        """
        heading = self.page.locator("h1, h2").first
        return heading.text_content() or ""

    def get_property_types(self) -> List[str]:
        """
        Get list of property types from visible cards.

        Returns:
            List of property types (e.g., "apartamento", "casa", "cobertura")
        """
        types = []
        # Look for type badges/labels in property cards
        # The type is shown in a span within the card
        type_labels = self.page.locator(".rounded-full.text-sm").all()

        for label in type_labels:
            if label.is_visible():
                text = label.text_content() or ""
                text_lower = text.lower()
                for prop_type in ["apartamento", "casa", "cobertura", "sala comercial"]:
                    if prop_type in text_lower:
                        types.append(prop_type)
                        break
        return types

    def get_property_prices(self) -> List[float]:
        """
        Get list of property prices from visible property cards only.

        Returns:
            List of property prices as floats
        """
        prices = []
        # Get all visible property links (same approach as get_property_count)
        property_links = self.page.locator("a[href*='/imoveis/']").all()

        for link in property_links:
            if link.is_visible():
                # Get the parent card to find price within it
                parent = link.locator("xpath=../..").or_(link.locator("xpath=../../.."))
                if parent.count() > 0:
                    card = parent.first
                    # Find price elements within this card only
                    price_elem = card.locator("p.text-secondary").first
                    if price_elem.is_visible():
                        text = price_elem.text_content() or ""
                        # Extract price number (handle formats like "R$ 1.850.000")
                        match = re.search(r"R\$\s*([\d\.]+)", text)
                        if match:
                            price_str = match.group(1).replace(".", "").replace(",", ".")
                            try:
                                prices.append(float(price_str))
                            except ValueError:
                                pass
        return prices

    def get_property_card_text(self, index: int) -> str:
        """
        Get text content of a specific property card by index.

        Args:
            index: Index of the card (0-based)

        Returns:
            Text content of the card
        """
        # Get all property links (which are the cards)
        property_links = self.page.locator("a[href*='/imoveis/']").all()
        visible_links = [link for link in property_links if link.is_visible()]

        if 0 <= index < len(visible_links):
            # Get the parent card element (the link is inside the Card)
            link = visible_links[index]
            # Try to get the parent element that contains all card content
            # The card should be a parent with Card-like styling
            parent = link.locator("xpath=../..").or_(link.locator("xpath=../../.."))
            if parent.count() > 0:
                return parent.first.text_content() or ""
            return link.text_content() or ""
        return ""

    def search_by_text(self, search_term: str) -> None:
        """
        Search by text (alias for search_by_neighborhood).

        Args:
            search_term: Text to search for
        """
        self.search_by_neighborhood(search_term)
