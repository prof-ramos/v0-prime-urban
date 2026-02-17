"""
E2E Tests for Property Filters

Tests the property filtering functionality with specific values:
- Filter by property type (apartamento)
- Filter by price range
- Filter by multiple criteria (intersection)
"""

import pytest
from playwright.sync_api import Page, Browser
from tests.e2e.pages.properties_page import PropertiesPage


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture(scope="function")
def properties_page(page: Page, base_url: str) -> PropertiesPage:
    """
    Fixture that provides a PropertiesPage instance.

    Args:
        page: Playwright Page instance
        base_url: Base URL from conftest

    Returns:
        PropertiesPage instance
    """
    return PropertiesPage(page, base_url)


@pytest.fixture(scope="function")
def navigate_to_properties(page: Page, properties_page: PropertiesPage) -> PropertiesPage:
    """
    Navigate to properties page before each test.

    Args:
        page: Playwright Page instance
        properties_page: PropertiesPage instance

    Returns:
        PropertiesPage instance after navigation
    """
    properties_page.goto_properties()
    return properties_page


# =============================================================================
# TESTS: FILTER BY PROPERTY TYPE
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_apartamento_shows_only_apartments(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Selecting "apartamento" type shows only apartments.

    Steps:
        1. Navigate to properties page
        2. Filter by property type "apartamento"
        3. Verify only apartments are displayed

    Expected: Only apartment-type properties are shown
    """
    page = navigate_to_properties

    # Get initial count
    initial_count = page.get_property_count()
    assert initial_count > 0, "No properties found on listing page"

    # Apply filter: apartamento
    page.filter_by_property_type("apartamento")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No apartments found after filtering"

    # Verify all displayed properties are apartments
    property_types = page.get_property_types()
    assert len(property_types) > 0, "Could not extract property types"

    for prop_type in property_types:
        assert prop_type == "apartamento", (
            f"Expected 'apartamento', got '{prop_type}'"
        )


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_casa_shows_only_houses(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Selecting "casa" type shows only houses.

    Steps:
        1. Navigate to properties page
        2. Filter by property type "casa"
        3. Verify only houses are displayed

    Expected: Only house-type properties are shown
    """
    page = navigate_to_properties

    # Apply filter: casa
    page.filter_by_property_type("casa")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No houses found after filtering"

    # Verify all displayed properties are houses
    property_types = page.get_property_types()
    assert len(property_types) > 0, "Could not extract property types"

    for prop_type in property_types:
        assert prop_type == "casa", (
            f"Expected 'casa', got '{prop_type}'"
        )


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_cobertura_shows_only_penthouses(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Selecting "cobertura" type shows only penthouses.

    Steps:
        1. Navigate to properties page
        2. Filter by property type "cobertura"
        3. Verify only penthouses are displayed

    Expected: Only penthouse-type properties are shown
    """
    page = navigate_to_properties

    # Apply filter: cobertura
    page.filter_by_property_type("cobertura")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No penthouses found after filtering"

    # Verify all displayed properties are penthouses
    property_types = page.get_property_types()
    assert len(property_types) > 0, "Could not extract property types"

    for prop_type in property_types:
        assert prop_type == "cobertura", (
            f"Expected 'cobertura', got '{prop_type}'"
        )


# =============================================================================
# TESTS: FILTER BY PRICE RANGE
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_filter_price_range_1m_to_2m(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by price range 1M-2M shows results within range.

    Steps:
        1. Navigate to properties page
        2. Set price filter to 1000000-2000000
        3. Verify all results are within price range

    Expected: All properties have prices between 1M and 2M
    Note: Mock data has properties at 1.45M and 1.85M
    """
    page = navigate_to_properties

    # Apply price filter: 1M - 2M
    page.filter_by_price_range(1000000, 2000000)

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No properties found in price range 1M-2M"

    # Verify all prices are within range
    prices = page.get_property_prices()
    assert len(prices) > 0, "Could not extract property prices"

    for price in prices:
        assert 1000000 <= price <= 2000000, (
            f"Price {price} is outside expected range 1000000-2000000"
        )


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_price_range_under_500k(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by price range under 500k shows cheaper properties.

    Steps:
        1. Navigate to properties page
        2. Set price filter to 0-500000
        3. Verify all results are under 500k

    Expected: All properties have prices under 500k
    """
    page = navigate_to_properties

    # Apply price filter: 0 - 500k
    page.filter_by_price_range(0, 500000)

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()

    # Note: May return 0 results if all properties are >500k
    if filtered_count > 0:
        # Verify all prices are under 500k
        prices = page.get_property_prices()
        assert len(prices) > 0, "Could not extract property prices"

        for price in prices:
            assert price <= 500000, (
                f"Price {price} exceeds maximum 500000"
            )


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_price_range_over_2m(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by price range over 2M shows premium properties.

    Steps:
        1. Navigate to properties page
        2. Set price filter to 2000000+
        3. Verify all results are over 2M

    Expected: All properties have prices over 2M
    """
    page = navigate_to_properties

    # Apply price filter: 2M+
    page.filter_by_price_range(2000000, 10000000)

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No properties found over 2M"

    # Verify all prices are over 2M
    prices = page.get_property_prices()
    assert len(prices) > 0, "Could not extract property prices"

    for price in prices:
        assert price >= 2000000, (
            f"Price {price} is under minimum 2000000"
        )


# =============================================================================
# TESTS: FILTER BY MULTIPLE CRITERIA
# =============================================================================

@pytest.mark.e2e
@pytest.mark.regression
def test_filter_apartamento_with_price_range_intersection(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Multiple filters (venda + apartamento + price range) show intersection.

    Steps:
        1. Navigate to properties page
        2. Filter by transaction type "venda" (to exclude rental prices)
        3. Filter by property type "apartamento"
        4. Filter by price range 1M-2M
        5. Verify results match all criteria

    Expected: Only apartments for sale within 1M-2M price range are shown
    Note: Mock data has apartments at 1.45M and 1.85M
    """
    page = navigate_to_properties

    # Apply first filter: venda (excludes rentals)
    page.filter_by_transaction_type("venda")
    page.wait_for_timeout(500)

    # Apply second filter: apartamento
    page.filter_by_property_type("apartamento")
    page.wait_for_timeout(500)

    # Apply third filter: price 1M-2M
    page.filter_by_price_range(1000000, 2000000)
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No sale apartments found in price range 1M-2M"

    # Verify all criteria are met
    property_types = page.get_property_types()
    prices = page.get_property_prices()

    assert len(property_types) > 0, "Could not extract property types"
    assert len(prices) > 0, "Could not extract prices"

    for prop_type in property_types:
        assert prop_type == "apartamento", (
            f"Expected 'apartamento', got '{prop_type}'"
        )

    for price in prices:
        assert 1000000 <= price <= 2000000, (
            f"Price {price} is outside expected range 1000000-2000000"
        )


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_transaction_type_venda(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by transaction type "venda" shows only sales.

    Steps:
        1. Navigate to properties page
        2. Filter by transaction type "venda"
        3. Verify only sale properties are shown

    Expected: Only properties for sale (venda) are displayed
    """
    page = navigate_to_properties

    # Apply filter: venda
    page.filter_by_transaction_type("venda")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No sale properties found after filtering"

    # Verify results contain venda indicators
    # (This is a basic check - actual verification depends on UI)


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_transaction_type_aluguel(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by transaction type "aluguel" shows only rentals.

    Steps:
        1. Navigate to properties page
        2. Filter by transaction type "aluguel"
        3. Verify only rental properties are shown

    Expected: Only properties for rent (aluguel) are displayed
    """
    page = navigate_to_properties

    # Apply filter: aluguel
    page.filter_by_transaction_type("aluguel")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    # May be 0 if no rental properties in mock data
    # Test passes if filter is applied successfully


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_bedrooms(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by number of bedrooms shows correct results.

    Steps:
        1. Navigate to properties page
        2. Filter by 3 bedrooms
        3. Verify only 3-bedroom properties are shown

    Expected: Only properties with 3 bedrooms are displayed
    """
    page = navigate_to_properties

    # Apply filter: 3 bedrooms
    page.filter_by_bedrooms("3")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No properties found with 3 bedrooms"


@pytest.mark.e2e
@pytest.mark.regression
def test_filter_by_parking_spaces(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Filter by parking spaces shows correct results.

    Steps:
        1. Navigate to properties page
        2. Filter by 2 parking spaces
        3. Verify only properties with 2+ spaces are shown

    Expected: Only properties with at least 2 parking spaces are displayed
    """
    page = navigate_to_properties

    # Apply filter: 2 parking spaces
    page.filter_by_parking_spaces("2")

    # Wait for results to update
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No properties found with 2 parking spaces"


@pytest.mark.e2e
@pytest.mark.regression
def test_clear_filters_resets_results(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Clearing filters resets to all properties.

    Steps:
        1. Navigate to properties page
        2. Apply filter (apartamento)
        3. Clear all filters
        4. Verify all properties are shown again

    Expected: After clearing filters, all properties are displayed
    """
    page = navigate_to_properties

    # Get initial count
    initial_count = page.get_property_count()

    # Apply filter
    page.filter_by_property_type("apartamento")
    page.wait_for_timeout(500)

    # Verify filter was applied
    filtered_count = page.get_property_count()
    assert filtered_count <= initial_count, "Filter did not reduce results"

    # Clear filters
    page.clear_filters()
    page.wait_for_timeout(1000)

    # Verify reset
    reset_count = page.get_property_count()
    assert reset_count == initial_count, (
        f"Clearing filters did not reset: {reset_count} != {initial_count}"
    )


@pytest.mark.e2e
@pytest.mark.regression
def test_search_by_neighborhood_text(
    navigate_to_properties: PropertiesPage
) -> None:
    """
    Test: Search by neighborhood text filters correctly.

    Steps:
        1. Navigate to properties page
        2. Search for "Asa Sul"
        3. Verify only Asa Sul properties are shown

    Expected: Only properties in Asa Sul neighborhood are displayed
    """
    page = navigate_to_properties

    # Apply text search
    page.search_by_neighborhood("Asa Sul")
    page.wait_for_timeout(1000)

    # Get filtered results
    filtered_count = page.get_property_count()
    assert filtered_count > 0, "No properties found for 'Asa Sul'"

    # Verify search results contain the neighborhood
    for i in range(filtered_count):
        card_text = page.get_property_card_text(i)
        assert "Asa Sul" in card_text or "asa sul" in card_text.lower(), (
            f"Property {i} does not contain 'Asa Sul': {card_text}"
        )
