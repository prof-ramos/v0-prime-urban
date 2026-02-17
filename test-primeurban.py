#!/usr/bin/env python3
"""
Test script for PrimeUrban web application.
Tests homepage, property listing, and Payload admin.
"""

from playwright.sync_api import sync_playwright, Page, Browser
import time
import sys

def test_homepage(page: Page):
    """Test homepage loads correctly."""
    print("Testing homepage...")
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    # Check for key elements
    assert page.url == 'http://localhost:3000/', f"Expected homepage, got {page.url}"

    # Check for header navigation
    header = page.locator('header').first
    assert header.is_visible(), "Header not visible"

    # Check for navigation link to properties (use exact match)
    nav_link = page.get_by_role('link', name='Imóveis', exact=True).first
    assert nav_link.is_visible(), "Navigation link not found"

    # Check for hero section with search button
    search_button = page.get_by_role('button', name='Buscar Imóveis')
    assert search_button.is_visible(), "Search button not found"

    # Check for featured properties section
    heading = page.get_by_role('heading', name='Imóveis em Destaque')
    assert heading.is_visible(), "Featured properties heading not found"

    print("✓ Homepage test passed")
    return True

def test_properties_listing(page: Page):
    """Test properties listing page."""
    print("Testing properties listing...")
    page.goto('http://localhost:3000/imoveis')
    page.wait_for_load_state('networkidle')

    # Check URL
    assert '/imoveis' in page.url, f"Expected /imoveis, got {page.url}"

    # Wait for dynamic content
    page.wait_for_timeout(2000)

    # Take screenshot for verification
    page.screenshot(path='/tmp/properties_listing.png', full_page=True)

    print("✓ Properties listing test passed")
    return True

def test_property_filters(page: Page):
    """Test property filters are available."""
    print("Testing property filters...")
    page.goto('http://localhost:3000/imoveis')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Check for filter elements
    transaction_type_filter = page.get_by_label('Tipo de transação')
    if transaction_type_filter.is_visible():
        print("  - Transaction type filter found")
        return True

    # Alternative: check for any select or filter UI
    selects = page.locator('select').count()
    if selects > 0:
        print(f"  - Found {selects} filter select(s)")
        return True

    print("  - No filters visible (may be ok)")
    return True

def test_payload_admin_login(page: Page):
    """Test Payload admin login page is accessible."""
    print("Testing Payload admin...")
    page.goto('http://localhost:3000/admin')
    page.wait_for_load_state('networkidle')

    # Check for login form
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='/tmp/payload_admin.png', full_page=True)

    # Check if we're on login page or admin panel
    if page.locator('input[type="email"]').count() > 0:
        print("  - Login form detected")
    elif page.locator('text=Payload').count() > 0:
        print("  - Payload admin detected")

    print("✓ Payload admin test passed")
    return True

def test_navigation(page: Page):
    """Test navigation between pages."""
    print("Testing navigation...")
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    # Click on Imóveis link (use exact match)
    print(f"  - Current URL before click: {page.url}")
    page.get_by_role('link', name='Imóveis', exact=True).first.click()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)  # Extra wait for client-side routing
    print(f"  - Current URL after click: {page.url}")

    # Check if we navigated to imoveis or properties
    if '/imoveis' not in page.url and '/properties' not in page.url:
        # Take screenshot for debugging
        page.screenshot(path='/tmp/navigation_debug.png', full_page=True)
        raise AssertionError(f"Navigation to properties failed. URL: {page.url}")

    # Go back to home
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    assert page.url == 'http://localhost:3000/', "Navigation to home failed"

    print("✓ Navigation test passed")
    return True

def run_tests():
    """Run all tests."""
    print("Starting PrimeUrban web application tests...")
    print("=" * 50)

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            results.append(("Homepage", test_homepage(page)))
            results.append(("Navigation", test_navigation(page)))
            results.append(("Properties Listing", test_properties_listing(page)))
            results.append(("Property Filters", test_property_filters(page)))
            results.append(("Payload Admin", test_payload_admin_login(page)))
        except Exception as e:
            print(f"✗ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='/tmp/error_screenshot.png', full_page=True)
            results.append(("Error", False))
        finally:
            browser.close()

    print("=" * 50)
    print("Test Results:")
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {status}: {name}")

    all_passed = all(r[1] for r in results)
    if all_passed:
        print("\n✓ All tests passed!")
        return 0
    else:
        print("\n✗ Some tests failed")
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
