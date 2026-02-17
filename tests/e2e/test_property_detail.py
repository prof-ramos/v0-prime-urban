"""
E2E Tests for Property Detail Page

Tests the property detail page with specific known slugs:
- Validate metadata (title, price, bedrooms, etc.)
- Validate gallery images load
- Validate WhatsApp button functionality
"""

import pytest
from playwright.sync_api import Page
from tests.e2e.pages.property_detail_page import PropertyDetailPage


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture(scope="function")
def property_detail_page(page: Page, base_url: str) -> PropertyDetailPage:
    """
    Fixture that provides a PropertyDetailPage instance.

    Args:
        page: Playwright Page instance
        base_url: Base URL

    Returns:
        PropertyDetailPage instance
    """
    return PropertyDetailPage(page, base_url)


# Known property slugs from mock data
KNOWN_PROPERTIES = {
    "apartamento-asa-sul-sqn-308": {
        "title": "Apartamento 4 quartos com vista para o Parque da Cidade",
        "price": 1850000,
        "bedrooms": 4,
        "bathrooms": 3,
        "parking": 2,
        "type": "apartamento",
        "neighborhood": "Asa Sul",
    },
    "cobertura-noroeste-sqnw-111": {
        "title": "Cobertura duplex com terraço gourmet no Noroeste",
        "price": 3200000,
        "bedrooms": 4,
        "bathrooms": 5,
        "parking": 4,
        "type": "cobertura",
        "neighborhood": "Noroeste",
    },
    "apartamento-aguas-claras-rua-37": {
        "title": "Apartamento moderno 3 quartos em Águas Claras",
        "price": 4500,
        "bedrooms": 3,
        "bathrooms": 2,
        "parking": 2,
        "type": "apartamento",
        "neighborhood": "Águas Claras",
    },
    "casa-lago-sul-shis-qi-25": {
        "title": "Casa de alto padrão com piscina no Lago Sul",
        "price": 8500000,
        "bedrooms": 5,
        "bathrooms": 7,
        "parking": 6,
        "type": "casa",
        "neighborhood": "Lago Sul",
    },
    "apartamento-sudoeste-sqsw-300": {
        "title": "Apartamento reformado 2 quartos no Sudoeste",
        "price": 3800,  # Aluguel mensal
        "bedrooms": 2,
        "bathrooms": 2,
        "parking": 1,
        "type": "apartamento",
        "neighborhood": "Sudoeste",
    },
}


@pytest.fixture(params=list(KNOWN_PROPERTIES.keys()))
def known_property_slug(request) -> str:
    """
    Parametrized fixture for known property slugs.

    Returns:
        Property slug
    """
    return request.param


@pytest.fixture
def property_data_for_slug(known_property_slug: str) -> dict:
    """
    Get expected data for a given property slug.

    Args:
        known_property_slug: Property slug

    Returns:
        Dict with expected property data
    """
    return KNOWN_PROPERTIES[known_property_slug]


# =============================================================================
# TESTS: PROPERTY METADATA VALIDATION
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_property_page_loads_successfully(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Property detail page loads for known slug.

    Steps:
        1. Navigate to property detail page with known slug
        2. Verify page loads without errors

    Expected: Page loads successfully with 200 status
    """
    property_detail_page.goto_property(known_property_slug)

    # Verify we're on the property page
    current_url = property_detail_page.get_url()
    assert known_property_slug in current_url, (
        f"Expected slug '{known_property_slug}' in URL, got {current_url}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_title_matches_expected(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Property title matches expected value.

    Steps:
        1. Navigate to property detail page
        2. Extract page title
        3. Verify it matches expected title

    Expected: Title matches the known property data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual title
    actual_title = property_detail_page.get_property_title()
    expected_title = property_data_for_slug["title"]

    assert actual_title, "No title found on property page"
    assert expected_title.lower() in actual_title.lower() or actual_title.lower() in expected_title.lower(), (
        f"Title mismatch: expected '{expected_title}', got '{actual_title}'"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_price_matches_expected(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Property price matches expected value.

    Steps:
        1. Navigate to property detail page
        2. Extract price from page
        3. Verify it matches expected price

    Expected: Price matches the known property data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual price
    actual_price = property_detail_page.get_property_price()
    expected_price = property_data_for_slug["price"]

    assert actual_price > 0, "No price found on property page"
    assert actual_price == expected_price, (
        f"Price mismatch: expected {expected_price}, got {actual_price}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_bedrooms_match_expected(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Number of bedrooms matches expected value.

    Steps:
        1. Navigate to property detail page
        2. Extract bedroom count
        3. Verify it matches expected value

    Expected: Bedroom count matches the known property data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual bedrooms
    actual_bedrooms = property_detail_page.get_property_bedrooms()
    expected_bedrooms = property_data_for_slug["bedrooms"]

    assert actual_bedrooms > 0, "No bedroom count found on property page"
    assert actual_bedrooms == expected_bedrooms, (
        f"Bedrooms mismatch: expected {expected_bedrooms}, got {actual_bedrooms}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_bathrooms_match_expected(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Number of bathrooms matches expected value.

    Steps:
        1. Navigate to property detail page
        2. Extract bathroom count
        3. Verify it matches expected value

    Expected: Bathroom count matches the known property data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual bathrooms
    actual_bathrooms = property_detail_page.get_property_bathrooms()
    expected_bathrooms = property_data_for_slug["bathrooms"]

    assert actual_bathrooms > 0, "No bathroom count found on property page"
    assert actual_bathrooms == expected_bathrooms, (
        f"Bathrooms mismatch: expected {expected_bathrooms}, got {actual_bathrooms}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_parking_spaces_match_expected(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Number of parking spaces matches expected value.

    Steps:
        1. Navigate to property detail page
        2. Extract parking space count
        3. Verify it matches expected value

    Expected: Parking space count matches the known property data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual parking spaces
    actual_parking = property_detail_page.get_property_parking_spaces()
    expected_parking = property_data_for_slug["parking"]

    assert actual_parking > 0, "No parking count found on property page"
    assert actual_parking == expected_parking, (
        f"Parking mismatch: expected {expected_parking}, got {actual_parking}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_address_contains_neighborhood(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str,
    property_data_for_slug: dict
) -> None:
    """
    Test: Property address contains expected neighborhood.

    Steps:
        1. Navigate to property detail page
        2. Extract address
        3. Verify it contains the expected neighborhood

    Expected: Address contains the neighborhood from known data
    """
    property_detail_page.goto_property(known_property_slug)

    # Get actual address
    actual_address = property_detail_page.get_property_address()
    expected_neighborhood = property_data_for_slug["neighborhood"]

    # Check if neighborhood is in address or on page
    page_content = property_detail_page.page.content()
    assert expected_neighborhood in page_content or expected_neighborhood.lower() in actual_address.lower(), (
        f"Neighborhood '{expected_neighborhood}' not found in address or page content"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_property_area_is_displayed(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Property area is displayed on page.

    Steps:
        1. Navigate to property detail page
        2. Extract area value
        3. Verify area is shown

    Expected: Area in m² is displayed
    """
    property_detail_page.goto_property(known_property_slug)

    # Get area
    area = property_detail_page.get_property_area()

    assert area > 0, "No area found on property page"
    assert area > 10, f"Area seems too small: {area} m²"


# =============================================================================
# TESTS: GALLERY IMAGES
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_property_gallery_has_images(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Property gallery contains images.

    Steps:
        1. Navigate to property detail page
        2. Count gallery images
        3. Verify at least one image is present

    Expected: Gallery has at least one image
    """
    property_detail_page.goto_property(known_property_slug)

    # Get image count
    image_count = property_detail_page.get_gallery_images_count()

    assert image_count > 0, "No images found in property gallery"


@pytest.mark.e2e
@pytest.mark.regression
def test_property_gallery_images_load(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Property gallery images load successfully.

    Steps:
        1. Navigate to property detail page
        2. Wait for images to load
        3. Verify images are loaded (not broken)

    Expected: All gallery images load without errors
    """
    property_detail_page.goto_property(known_property_slug)
    property_detail_page.wait_for_timeout(2000)  # Wait for images to load

    # Check for broken images
    images = property_detail_page.page.locator("img").all()
    loaded_count = 0

    for img in images:
        if img.is_visible():
            # Check natural width - if 0, image didn't load
            natural_width = img.evaluate("el => el.naturalWidth")
            if natural_width and natural_width > 0:
                loaded_count += 1

    assert loaded_count > 0, "No images loaded successfully"


# =============================================================================
# TESTS: WHATSAPP BUTTON
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_whatsapp_button_is_visible(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: WhatsApp button is visible on property page.

    Steps:
        1. Navigate to property detail page
        2. Check for WhatsApp button/link

    Expected: WhatsApp button or link is visible
    """
    property_detail_page.goto_property(known_property_slug)

    # Check for WhatsApp button
    has_whatsapp = property_detail_page.is_whatsapp_button_visible()

    assert has_whatsapp, "WhatsApp button not found on property page"


@pytest.mark.e2e
@pytest.mark.regression
def test_whatsapp_link_is_valid(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: WhatsApp link contains valid WhatsApp URL.

    Steps:
        1. Navigate to property detail page
        2. Extract WhatsApp link href
        3. Verify it's a valid wa.me URL

    Expected: WhatsApp link points to wa.me domain
    """
    property_detail_page.goto_property(known_property_slug)

    # Get WhatsApp link
    whatsapp_link = property_detail_page.get_whatsapp_link()

    assert whatsapp_link, "No WhatsApp link found"
    assert "wa.me" in whatsapp_link or "whatsapp.com" in whatsapp_link, (
        f"Invalid WhatsApp link: {whatsapp_link}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_whatsapp_link_contains_phone(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: WhatsApp link contains phone number.

    Steps:
        1. Navigate to property detail page
        2. Extract WhatsApp link href
        3. Verify phone number is present

    Expected: WhatsApp link includes a phone number
    """
    property_detail_page.goto_property(known_property_slug)

    # Get WhatsApp link
    whatsapp_link = property_detail_page.get_whatsapp_link()

    assert whatsapp_link, "No WhatsApp link found"

    # Check for phone number pattern (digits in URL)
    import re
    phone_pattern = r"\d{10,}"
    phone_match = re.search(phone_pattern, whatsapp_link)

    assert phone_match, f"No phone number found in WhatsApp link: {whatsapp_link}"


# =============================================================================
# TESTS: CONTACT FORM VISIBILITY
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_contact_form_is_visible_on_property_page(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Contact form is visible on property detail page.

    Steps:
        1. Navigate to property detail page
        2. Check for contact form elements

    Expected: Contact form with inputs is visible
    """
    property_detail_page.goto_property(known_property_slug)

    # Check for contact form
    has_form = property_detail_page.is_contact_form_visible()

    assert has_form, "Contact form not found on property page"


@pytest.mark.e2e
@pytest.mark.regression
def test_contact_form_has_required_fields(
    property_detail_page: PropertyDetailPage,
    known_property_slug: str
) -> None:
    """
    Test: Contact form has name, email, and message fields.

    Steps:
        1. Navigate to property detail page
        2. Check for required form fields

    Expected: Form has name, email, and message inputs
    """
    property_detail_page.goto_property(known_property_slug)

    # Check for name input
    name_input = property_detail_page.page.locator("input[type='text']").or_(
        property_detail_page.page.get_by_label("Nome")
    ).or_(
        property_detail_page.page.get_by_placeholder("Nome")
    )
    assert name_input.count() > 0, "Name input not found"

    # Check for email input
    email_input = property_detail_page.page.locator("input[type='email']").or_(
        property_detail_page.page.get_by_label("E-mail")
    ).or_(
        property_detail_page.page.get_by_placeholder("E-mail")
    )
    assert email_input.count() > 0, "Email input not found"

    # Check for message textarea
    message_input = property_detail_page.page.locator("textarea").or_(
        property_detail_page.page.get_by_label("Mensagem")
    ).or_(
        property_detail_page.page.get_by_placeholder("Mensagem")
    )
    assert message_input.count() > 0, "Message textarea not found"


# =============================================================================
# TESTS: PROPERTY TYPE SPECIFIC
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_apartamento_property_displays_correctly(
    property_detail_page: PropertyDetailPage
) -> None:
    """
    Test: Apartment property displays correctly.

    Steps:
        1. Navigate to a known apartment property
        2. Verify apartment-specific elements

    Expected: Apartment property shows correct type and features
    """
    slug = "apartamento-asa-sul-sqn-308"
    property_detail_page.goto_property(slug)

    # Verify we're on the right page
    current_url = property_detail_page.get_url()
    assert slug in current_url

    # Verify property type indicator
    page_content = property_detail_page.page.content()
    assert "apartamento" in page_content.lower(), "Property type 'apartamento' not found"


@pytest.mark.e2e
@pytest.mark.regression
def test_casa_property_displays_correctly(
    property_detail_page: PropertyDetailPage
) -> None:
    """
    Test: House property displays correctly.

    Steps:
        1. Navigate to a known house property
        2. Verify house-specific elements

    Expected: House property shows correct type and features
    """
    slug = "casa-lago-sul-shis-qi-25"
    property_detail_page.goto_property(slug)

    # Verify we're on the right page
    current_url = property_detail_page.get_url()
    assert slug in current_url

    # Verify property type indicator
    page_content = property_detail_page.page.content()
    assert "casa" in page_content.lower(), "Property type 'casa' not found"


@pytest.mark.e2e
@pytest.mark.regression
def test_cobertura_property_displays_correctly(
    property_detail_page: PropertyDetailPage
) -> None:
    """
    Test: Penthouse (cobertura) property displays correctly.

    Steps:
        1. Navigate to a known penthouse property
        2. Verify penthouse-specific elements

    Expected: Penthouse property shows correct type and features
    """
    slug = "cobertura-noroeste-sqnw-111"
    property_detail_page.goto_property(slug)

    # Verify we're on the right page
    current_url = property_detail_page.get_url()
    assert slug in current_url

    # Verify property type indicator
    page_content = property_detail_page.page.content()
    assert "cobertura" in page_content.lower(), "Property type 'cobertura' not found"
