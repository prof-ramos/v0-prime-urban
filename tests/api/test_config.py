"""
Testes de configuração do ambiente de testes.

Este arquivo contém testes básicos para validar que o ambiente
de testes está configurado corretamente.
"""

import pytest


class TestPytestConfig:
    """Testes de configuração do pytest."""

    def test_pytest_installed(self):
        """Verifica que pytest está instalado."""
        import pytest
        assert pytest.__version__ is not None

    def test_python_version(self):
        """Verifica versão do Python."""
        import sys
        assert sys.version_info >= (3, 14)

    def test_requests_installed(self):
        """Verifica que requests está instalado."""
        import requests
        assert requests.__version__ is not None

    def test_pydantic_installed(self):
        """Verifica que pydantic está instalado."""
        import pydantic
        assert pydantic.__version__ is not None


class TestFixturesAvailable:
    """Testes de disponibilidade de fixtures."""

    def test_payload_config_fixture(self, payload_config):
        """Testa que fixture payload_config está disponível."""
        assert payload_config is not None
        assert "base_url" in payload_config
        assert "api_path" in payload_config
        assert "admin" in payload_config

    def test_api_base_url_fixture(self, api_base_url):
        """Testa que fixture api_base_url está disponível."""
        assert api_base_url is not None
        assert api_base_url.startswith("http")


@pytest.mark.smoke
class TestSmoke:
    """Testes de fumaça básicos."""

    def test_smoke_test(self):
        """Teste de fumaça - verifica que testes rodam."""
        assert True

    def test_import_utils(self):
        """Testa que utils podem ser importados."""
        from tests.api.utils import (
            AuthenticatedAPIClient,
            AnonymousAPIClient,
            normalize_phone_br,
        )
        assert AuthenticatedAPIClient is not None
        assert AnonymousAPIClient is not None
        assert normalize_phone_br is not None

    def test_import_factories(self):
        """Testa que factories podem ser importados."""
        from tests.api.fixtures import (
            PropertyFactory,
            LeadFactory,
            UserFactory,
        )
        assert PropertyFactory is not None
        assert LeadFactory is not None
        assert UserFactory is not None


@pytest.mark.api
class TestAPIUtils:
    """Testes de utilitários de API."""

    def test_normalize_phone_br(self):
        """Testa normalização de telefone brasileiro."""
        from tests.api.utils import normalize_phone_br

        assert normalize_phone_br("(61) 99999-9999") == "+5561999999999"
        assert normalize_phone_br("61 99999 9999") == "+5561999999999"
        assert normalize_phone_br("61999999999") == "+5561999999999"
        assert normalize_phone_br("+55 61 99999-9999") == "+5561999999999"

    def test_property_factory_minimal(self):
        """Testa factory de property minimal."""
        from tests.api.fixtures import PropertyFactory

        property_data = PropertyFactory.minimal(
            neighborhood_id="neighborhood_123",
            media_id="media_123",
            agent_id="agent_123"
        )

        assert "title" in property_data
        assert "type" in property_data
        assert "price" in property_data
        assert property_data["type"] == "sale"

    def test_lead_factory_with_phone(self):
        """Testa factory de lead com phone."""
        from tests.api.fixtures import LeadFactory

        lead_data = LeadFactory.with_phone()

        assert "name" in lead_data
        assert "phone" in lead_data
        assert "status" in lead_data
        assert lead_data["status"] == "new"

    def test_user_factory_agent(self):
        """Testa factory de user agent."""
        from tests.api.fixtures import UserFactory

        user_data = UserFactory.agent()

        assert "email" in user_data
        assert "password" in user_data
        assert "name" in user_data
        assert user_data["role"] == "agent"
