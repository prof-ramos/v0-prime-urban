"""
Page Objects for E2E Tests

This module provides page object classes for PrimeUrban E2E tests.
"""

from .base_page import BasePage
from .properties_page import PropertiesPage
from .property_detail_page import PropertyDetailPage
from .contact_form_page import ContactFormPage

__all__ = [
    "BasePage",
    "PropertiesPage",
    "PropertyDetailPage",
    "ContactFormPage",
]
