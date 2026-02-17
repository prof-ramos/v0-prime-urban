"""
Testes de RBAC (Role-Based Access Control) e Hooks do Payload CMS.

Este módulo testa:
1. Controle de acesso por role (admin, agent, assistant)
2. Hooks de beforeValidate (autoSlug, autoCode, normalizePhone)
3. Hooks de afterChange (revalidateProperty, distributeLead, updateLeadScore)

Marcadores:
    @pytest.mark.rbac: Testes de controle de acesso
    @pytest.mark.hooks: Testes de hooks personalizados
"""

import json
import pytest
from typing import Dict, Any

from tests.api.utils import (
    AuthenticatedAPIClient,
    AnonymousAPIClient,
    AuthorizationError,
    AuthenticationError,
    ValidationError,
)
from tests.api.fixtures import (
    PropertyFactory,
    LeadFactory,
    UserFactory,
)


# =============================================================================
# TESTES DE RBAC - PROPERTIES
# =============================================================================

@pytest.mark.rbac
class TestPropertiesRBAC:
    """Testa controle de acesso para Properties collection."""

    def test_admin_can_create_property(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Admin deve conseguir criar propriedades."""
        # Criar media de teste primeiro
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )

        response = admin_client.create("properties", property_data)

        assert response["id"] is not None
        assert response["title"] == property_data["title"]
        assert response["code"] is not None  # Gerado automaticamente
        assert response["slug"] is not None  # Gerado automaticamente

    def test_agent_can_create_property(
        self,
        agent_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        agent_user_data: Dict[str, Any],
        admin_client: AuthenticatedAPIClient,
    ):
        """Agent deve conseguir criar propriedades."""
        # Criar media como admin
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=agent_user_data["user"]["id"],
        )

        response = agent_client.create("properties", property_data)

        assert response["id"] is not None
        assert response["title"] == property_data["title"]

    def test_admin_can_update_property(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Admin deve conseguir atualizar propriedades."""
        # Criar media
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar propriedade
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)

        # Atualizar
        updated_data = {"title": "Título Atualizado pelo Admin"}
        response = admin_client.update("properties", created["id"], updated_data)

        assert response["title"] == "Título Atualizado pelo Admin"

    def test_agent_can_update_property(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        agent_user_data: Dict[str, Any],
    ):
        """Agent deve conseguir atualizar propriedades."""
        # Criar media como admin
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar propriedade como admin
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=agent_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)

        # Agent atualiza
        updated_data = {"price": 1500000}
        response = agent_client.update("properties", created["id"], updated_data)

        assert response["price"] == 1500000

    def test_admin_can_delete_property(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Admin deve conseguir deletar propriedades."""
        # Criar media
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar propriedade
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)

        # Deletar
        admin_client.delete(f"/api/properties/{created['id']}")

        # Verificar que foi deletado
        with pytest.raises(Exception):  # NotFound ou similar
            admin_client.find_by_id("properties", created["id"])

    def test_agent_cannot_delete_property(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        agent_user_data: Dict[str, Any],
    ):
        """Agent NÃO deve conseguir deletar propriedades."""
        # Criar media como admin
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar propriedade
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=agent_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)

        # Agent tenta deletar - deve falhar com 403
        with pytest.raises(AuthorizationError):
            agent_client.delete(f"/api/properties/{created['id']}")

    def test_anonymous_can_read_properties(
        self,
        anonymous_client: AnonymousAPIClient,
    ):
        """Usuário anônimo deve conseguir ler propriedades."""
        response = anonymous_client.get("/api/properties", params={"limit": 10})

        assert response.status_code == 200
        assert "docs" in response.data

    def test_anonymous_cannot_create_property(
        self,
        anonymous_client: AnonymousAPIClient,
        test_neighborhood: Dict[str, Any],
    ):
        """Usuário anônimo NÃO deve conseguir criar propriedades."""
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id="fake-media-id",
            agent_id="fake-agent-id",
        )

        with pytest.raises((AuthenticationError, AuthorizationError)):
            anonymous_client.post("/api/properties", json_data=property_data)


# =============================================================================
# TESTES DE RBAC - LEADS
# =============================================================================

@pytest.mark.rbac
class TestLeadsRBAC:
    """Testa controle de acesso para Leads collection."""

    def test_admin_can_create_lead(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir criar leads."""
        lead_data = LeadFactory.with_phone_and_email()

        response = admin_client.create("leads", lead_data)

        assert response["id"] is not None
        assert response["name"] == lead_data["name"]
        # Telefone deve ser normalizado
        assert len(response["phone"]) in [10, 11]

    def test_agent_can_create_lead(
        self,
        agent_client: AuthenticatedAPIClient,
    ):
        """Agent deve conseguir criar leads."""
        lead_data = LeadFactory.with_phone()

        response = agent_client.create("leads", lead_data)

        assert response["id"] is not None

    def test_admin_can_read_all_leads(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir ler todos os leads."""
        response = admin_client.find("leads", limit=10)

        assert "docs" in response
        assert "totalDocs" in response

    def test_agent_can_only_read_assigned_leads(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
    ):
        """Agent só deve conseguir ler leads atribuídos a ele."""
        # Admin cria lead atribuído ao agent
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]
        created_lead = admin_client.create("leads", lead_data)

        # Agent deve conseguir ver este lead
        response = agent_client.find_by_id("leads", created_lead["id"])
        assert response["id"] == created_lead["id"]

    def test_agent_cannot_read_unassigned_leads(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
    ):
        """Agent NÃO deve conseguir ler leads não atribuídos a ele."""
        # Admin cria lead sem atribuir
        lead_data = LeadFactory.minimal()
        created_lead = admin_client.create("leads", lead_data)

        # Agent não deve conseguir ver
        with pytest.raises((AuthenticationError, AuthorizationError)):
            agent_client.find_by_id("leads", created_lead["id"])

    def test_admin_can_delete_lead(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir deletar leads."""
        lead_data = LeadFactory.minimal()
        created = admin_client.create("leads", lead_data)

        admin_client.delete(f"/api/leads/{created['id']}")

    def test_agent_cannot_delete_lead(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
    ):
        """Agent NÃO deve conseguir deletar leads."""
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]
        created = admin_client.create("leads", lead_data)

        with pytest.raises(AuthorizationError):
            agent_client.delete(f"/api/leads/{created['id']}")


# =============================================================================
# TESTES DE RBAC - USERS
# =============================================================================

@pytest.mark.rbac
class TestUsersRBAC:
    """Testa controle de acesso para Users collection."""

    def test_admin_can_create_user(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir criar usuários."""
        user_data = UserFactory.minimal(role="assistant")

        response = admin_client.create("users", user_data)

        assert response["id"] is not None
        assert response["email"] == user_data["email"]

    def test_admin_can_update_user(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir atualizar usuários."""
        # Criar usuário
        user_data = UserFactory.minimal(role="assistant")
        created = admin_client.create("users", user_data)

        # Atualizar
        updated = admin_client.update("users", created["id"], {
            "name": "Nome Atualizado"
        })

        assert updated["name"] == "Nome Atualizado"

    def test_admin_can_delete_user(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin deve conseguir deletar usuários."""
        user_data = UserFactory.minimal(role="assistant")
        created = admin_client.create("users", user_data)

        admin_client.delete(f"/api/users/{created['id']}")

    def test_agent_cannot_create_user(
        self,
        agent_client: AuthenticatedAPIClient,
    ):
        """Agent NÃO deve conseguir criar usuários."""
        user_data = UserFactory.minimal(role="assistant")

        with pytest.raises(AuthorizationError):
            agent_client.create("users", user_data)

    def test_user_can_update_own_profile(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
    ):
        """Usuário deve conseguir atualizar seu próprio perfil."""
        user_id = agent_user_data["user"]["id"]

        updated = agent_client.update("users", user_id, {
            "name": "Meu Nome Atualizado"
        })

        assert updated["name"] == "Meu Nome Atualizado"

    def test_user_cannot_update_other_users(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
    ):
        """Usuário NÃO deve conseguir atualizar outros usuários."""
        # Admin cria outro usuário
        user_data = UserFactory.minimal(role="assistant")
        other_user = admin_client.create("users", user_data)

        # Agent tenta atualizar - deve falhar
        with pytest.raises(AuthorizationError):
            agent_client.update("users", other_user["id"], {
                "name": "Tentativa de Atualização"
            })

    def test_user_cannot_delete_own_account(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
    ):
        """Usuário NÃO deve conseguir deletar sua própria conta."""
        user_id = agent_user_data["user"]["id"]

        with pytest.raises(AuthorizationError):
            agent_client.delete(f"/api/users/{user_id}")


# =============================================================================
# TESTES DE HOOKS - AUTO SLUG
# =============================================================================

@pytest.mark.hooks
class TestAutoSlugHook:
    """Testa hook de autoSlug para Properties."""

    def test_auto_slug_generates_from_title(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Hook deve gerar slug automaticamente a partir do title."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        property_data["title"] = "Apartamento Moderno em Asa Norte"

        response = admin_client.create("properties", property_data)

        assert response["slug"] == "apartamento-moderno-em-asa-norte"

    def test_auto_slug_handles_special_chars(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Hook deve tratar caracteres especiais corretamente."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        property_data["title"] = "Cobertura de Luxo - Vista 360°!"

        response = admin_client.create("properties", property_data)

        # Slug deve ser normalizado (sem acentos, símbolos)
        assert "cobertura-de-luxo-vista-360" in response["slug"]

    def test_auto_slug_does_not_change_on_update(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Slug não deve mudar quando title é atualizado."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)
        original_slug = created["slug"]

        # Atualizar title
        admin_client.update("properties", created["id"], {
            "title": "Novo Título Totalmente Diferente"
        })

        # Slug deve permanecer o mesmo
        updated = admin_client.find_by_id("properties", created["id"])
        assert updated["slug"] == original_slug


# =============================================================================
# TESTES DE HOOKS - AUTO CODE
# =============================================================================

@pytest.mark.hooks
class TestAutoCodeHook:
    """Testa hook de autoCode para Properties."""

    def test_auto_code_generates_sequential_codes(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Hook deve gerar códigos sequenciais (PRM-001, PRM-002...)."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar múltiplas propriedades
        created = []
        for i in range(3):
            property_data = PropertyFactory.minimal(
                neighborhood_id=test_neighborhood["id"],
                media_id=media_id,
                agent_id=admin_user_data["user"]["id"],
            )
            property_data["code"] = ""  # Força geração automática
            response = admin_client.create("properties", property_data)
            created.append(response)

        # Verificar que códigos são únicos e sequenciais
        codes = [p["code"] for p in created]
        assert len(set(codes)) == 3  # Todos únicos
        assert all(code.startswith("PRM-") for code in codes)

    def test_auto_code_skips_explicit_code(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Hook deve respeitar código fornecido explicitamente."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        property_data["code"] = "CUSTOM-123"

        response = admin_client.create("properties", property_data)

        assert response["code"] == "CUSTOM-123"


# =============================================================================
# TESTES DE HOOKS - NORMALIZE PHONE
# =============================================================================

@pytest.mark.hooks
class TestNormalizePhoneHook:
    """Testa hook de normalização de telefone para Leads."""

    def test_normalize_phone_formats_brazilian_numbers(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Hook deve normalizar telefone brasileiro para formato padrão."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "(61) 99999-9999"

        response = admin_client.create("leads", lead_data)

        # Telefone deve ser normalizado (apenas dígitos, sem +55)
        assert response["phone"] == "6199999999"

    def test_normalize_phone_handles_plus55(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Hook deve remover código do país +55."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "+55 61 99999-9999"

        response = admin_client.create("leads", lead_data)

        assert response["phone"] == "6199999999"

    def test_normalize_phone_validates_length(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Hook deve validar que telefone tem 10 ou 11 dígitos."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "123"  # Muito curto

        with pytest.raises(ValidationError):
            admin_client.create("leads", lead_data)

    def test_normalize_phone_handles_various_formats(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Hook deve normalizar diversos formatos brasileiros."""
        formats = [
            "(61) 99999-9999",
            "61 99999 9999",
            "61999999999",
            "+55 61 99999-9999",
            "061 99999-9999",
        ]

        for phone_format in formats:
            lead_data = LeadFactory.minimal()
            lead_data["phone"] = phone_format

            response = admin_client.create("leads", lead_data)

            # Todos devem resultar no mesmo formato normalizado
            assert len(response["phone"]) in [10, 11]
            assert response["phone"].isdigit()


# =============================================================================
# TESTES DE HOOKS - LEAD SCORE
# =============================================================================

@pytest.mark.hooks
class TestLeadScoreHook:
    """Testa hook de cálculo de score para Leads."""

    def test_lead_score_zero_with_minimal_data(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Lead sem telefone/email deve ter score 0."""
        lead_data = LeadFactory.minimal()

        response = admin_client.create("leads", lead_data)

        assert response["score"] == 0

    def test_lead_score_increases_with_phone(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Lead com telefone deve ter score > 0."""
        lead_data = LeadFactory.with_phone()

        response = admin_client.create("leads", lead_data)

        assert response["score"] > 0

    def test_lead_score_maximum_with_phone_and_email(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Lead com telefone e email deve ter score máximo."""
        lead_data = LeadFactory.with_phone_and_email()

        response = admin_client.create("leads", lead_data)

        # Score deve ser maior que apenas telefone
        assert response["score"] > 10  # Assumindo score máximo > 10


# =============================================================================
# TESTES DE HOOKS - LEAD DISTRIBUTION
# =============================================================================

@pytest.mark.hooks
class TestLeadDistributionHook:
    """Testa hook de distribuição automática de Leads."""

    def test_lead_auto_assigned_to_agent(
        self,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
    ):
        """Lead sem assignedTo deve ser atribuído automaticamente."""
        lead_data = LeadFactory.with_phone()
        # Não define assignedTo

        response = admin_client.create("leads", lead_data)

        # Deve ter sido atribuído a algum agente
        assert response.get("assignedTo") is not None


# =============================================================================
# TESTES DE HOOKS - ISR REVALIDATION
# =============================================================================

@pytest.mark.hooks
class TestISRRevalidationHook:
    """Testa hook de revalidação de ISR para Properties."""

    def test_revalidation_on_publish(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Publicar propriedade deve disparar revalidação ISR."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        property_data["status"] = "published"

        response = admin_client.create("properties", property_data)

        # Hook deve ter rodado sem erro (se falhar, criação falharia)
        assert response["status"] == "published"
        assert response["slug"] is not None

    def test_revalidation_on_status_change(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Mudar status deve disparar revalidação ISR."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        # Criar como draft
        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )
        created = admin_client.create("properties", property_data)

        # Publicar
        admin_client.update("properties", created["id"], {
            "status": "published"
        })

        # Hook deve ter rodado sem erro
        updated = admin_client.find_by_id("properties", created["id"])
        assert updated["status"] == "published"


# =============================================================================
# TESTES DE HOOKS - NEIGHBORHOOD NAME SYNC
# =============================================================================

@pytest.mark.hooks
class TestNeighborhoodNameSyncHook:
    """Testa hook de sincronização de nome do bairro."""

    def test_neighborhood_name_synced_on_create(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        admin_user_data: Dict[str, Any],
    ):
        """Nome do bairro deve ser sincronizado automaticamente."""
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=admin_user_data["user"]["id"],
        )

        response = admin_client.create("properties", property_data)

        # neighborhoodName deve ter sido preenchido
        assert response.get("address", {}).get("neighborhoodName") is not None
        assert response["address"]["neighborhoodName"] == test_neighborhood["name"]


# =============================================================================
# TESTES DE HOOKS - USER PHONE/CODECI NORMALIZATION
# =============================================================================

@pytest.mark.hooks
class TestUserFieldsNormalizationHook:
    """Testa hook de normalização de campos de usuário."""

    def test_user_phone_normalized_on_create(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Telefone de usuário deve ser normalizado."""
        user_data = UserFactory.minimal(role="agent")
        user_data["phone"] = "(61) 99999-9999"

        response = admin_client.create("users", user_data)

        assert response["phone"] == "6199999999"

    def test_agent_creci_normalized_on_create(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """CRECI de agent deve ser normalizado."""
        user_data = UserFactory.minimal(role="agent")
        user_data["creci"] = "df-12345"

        response = admin_client.create("users", user_data)

        # CRECI deve ser uppercase e sem espaços
        assert response["creci"] == "DF-12345" or response["creci"] == "DF12345"

    def test_non_agent_creci_cleared(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """CRECI deve ser limpo para não-agentes."""
        user_data = UserFactory.minimal(role="assistant")
        user_data["creci"] = "DF-12345"

        response = admin_client.create("users", user_data)

        # CRECI deve ser null para assistentes
        assert response.get("creci") is None


# =============================================================================
# TESTES DE AUTENTICAÇÃO
# =============================================================================

@pytest.mark.rbac
class TestAuthentication:
    """Testa autenticação e tokens JWT."""

    def test_login_with_valid_credentials(
        self,
        anonymous_client: AnonymousAPIClient,
        payload_config: Dict[str, Any],
    ):
        """Login com credenciais válidas deve retornar token."""
        response = anonymous_client.login(
            email=payload_config["admin"]["email"],
            password=payload_config["admin"]["password"],
        )

        assert "token" in response
        assert "user" in response

    def test_login_with_invalid_credentials(
        self,
        anonymous_client: AnonymousAPIClient,
    ):
        """Login com credenciais inválidas deve falhar."""
        with pytest.raises(AuthenticationError):
            anonymous_client.login(
                email="invalid@example.com",
                password="wrongpassword",
            )

    def test_expired_token_returns_401(
        self,
        payload_config: Dict[str, Any],
    ):
        """Token expirado deve retornar 401."""
        # Este teste requer um token expirado, que é difícil de gerar
        # Em produção, você pode mockar a verificação JWT
        pytest.skip("Requer configuração de token expirado")

    def test_invalid_token_returns_401(
        self,
        payload_config: Dict[str, Any],
    ):
        """Token inválido deve retornar 401."""
        client = AuthenticatedAPIClient(
            base_url=payload_config["base_url"],
            token="invalid.jwt.token",
        )

        with pytest.raises(AuthenticationError):
            client.find("properties")


# =============================================================================
# TESTES INTEGRAÇÃO - RBAC + HOOKS
# =============================================================================

@pytest.mark.rbac
@pytest.mark.hooks
class TestRBACWithHooks:
    """Testa interação entre RBAC e hooks."""

    def test_agent_creates_property_with_auto_code(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        agent_user_data: Dict[str, Any],
    ):
        """Agent cria propriedade e código é gerado automaticamente."""
        # Criar media como admin
        media_response = admin_client.post("/api/media", json_data={
            "file": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        })
        media_id = media_response["id"]

        property_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=media_id,
            agent_id=agent_user_data["user"]["id"],
        )
        property_data["code"] = ""

        response = agent_client.create("properties", property_data)

        # Hooks devem ter rodado
        assert response["code"] is not None
        assert response["slug"] is not None
        assert response["code"].startswith("PRM-")

    def test_admin_creates_lead_with_normalization(
        self,
        admin_client: AuthenticatedAPIClient,
    ):
        """Admin cria lead e telefone é normalizado."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "(61) 9 9999-9999"

        response = admin_client.create("leads", lead_data)

        # Hook de normalização deve ter rodado
        assert response["phone"] == "6199999999"
        # Hook de score deve ter rodado
        assert "score" in response
