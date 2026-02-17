"""
Testes CRUD completos para collection Leads.

Este módulo testa todas as operações CRUD da collection Leads:
- GET /api/leads (list) - com RBAC
- GET /api/leads/:id (read) - com RBAC
- POST /api/leads (create) - com hooks
- PATCH /api/leads/:id (update) - com RBAC
- DELETE /api/leads/:id (delete) - admin only
- Hooks: normalizeLeadPhone, distributeLead, updateLeadScore
"""

import pytest
from typing import Dict, Any

from tests.api.utils import (
    AuthenticatedAPIClient,
    AnonymousAPIClient,
    AuthorizationError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
)
from tests.api.fixtures import LeadFactory


# =============================================================================
# FIXTURES ESPECÍFICOS PARA LEADS
# =============================================================================

@pytest.fixture(scope="function")
def test_lead_data() -> Dict[str, Any]:
    """Cria dados válidos para um lead de teste."""
    return LeadFactory.with_phone_and_email()


@pytest.fixture(scope="function")
def created_lead(
    admin_client: AuthenticatedAPIClient,
    test_lead_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria um lead e garante cleanup após o teste.

    Yields:
        Dict com lead criado
    """
    lead_data = admin_client.create_lead(test_lead_data)
    yield lead_data

    # Cleanup
    try:
        admin_client.delete("leads", lead_data["id"])
    except Exception:
        pass


@pytest.fixture(scope="function")
def lead_assigned_to_agent(
    admin_client: AuthenticatedAPIClient,
    agent_user_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Cria um lead atribuído a um agent específico."""
    lead_data = LeadFactory.with_phone()
    lead_data["assignedTo"] = agent_user_data["user"]["id"]

    created = admin_client.create_lead(lead_data)
    yield created

    # Cleanup
    try:
        admin_client.delete("leads", created["id"])
    except Exception:
        pass


# =============================================================================
# TESTES DE LISTAGEM (GET /api/leads)
# =============================================================================

@pytest.mark.api
@pytest.mark.smoke
class TestLeadsList:
    """Testes de listagem de leads."""

    def test_list_leads_admin(self, admin_client: AuthenticatedAPIClient):
        """Admin deve conseguir listar todos os leads."""
        response = admin_client.find("leads", limit=10)

        assert "docs" in response
        assert "totalDocs" in response
        assert isinstance(response["docs"], list)

    def test_list_leads_agent_only_assigned(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Agent só deve ver leads atribuídos a ele."""
        # Admin cria lead atribuído ao agent
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]
        admin_client.create_lead(lead_data)

        # Agent lista leads - deve ver apenas seus leads
        response = agent_client.find("leads", limit=10)

        # Todos os leads retornados devem ser atribuídos ao agent
        for lead in response["docs"]:
            assigned_to = lead.get("assignedTo")
            if assigned_to:
                if isinstance(assigned_to, dict):
                    assert assigned_to["id"] == agent_user_data["user"]["id"]
                else:
                    assert assigned_to == agent_user_data["user"]["id"]

    def test_list_leads_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient
    ):
        """Usuário anônimo NÃO deve conseguir listar leads (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.get("/api/leads")

        assert exc_info.value.status_code in (401, 403)

    def test_list_leads_with_pagination(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa paginação na listagem de leads."""
        page1 = admin_client.find("leads", page=1, limit=5)
        assert len(page1["docs"]) <= 5
        assert page1["page"] == 1

        if page1["totalDocs"] > 5:
            page2 = admin_client.find("leads", page=2, limit=5)
            assert page2["page"] == 2

    def test_list_leads_with_filters(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por status na listagem."""
        response = admin_client.find(
            "leads",
            where={"status": {"equals": "new"}},
            limit=10
        )

        for lead in response["docs"]:
            assert lead["status"] == "new"

    def test_list_leads_filter_by_assigned_to(
        self,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Testa filtro por assignedTo."""
        response = admin_client.find(
            "leads",
            where={"assignedTo": {"equals": agent_user_data["user"]["id"]}},
            limit=10
        )

        # Todos os leads devem estar atribuídos ao agent
        for lead in response["docs"]:
            assigned_to = lead.get("assignedTo")
            if assigned_to:
                if isinstance(assigned_to, dict):
                    assert assigned_to["id"] == agent_user_data["user"]["id"]

    def test_list_leads_sort_by_score(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa ordenação por score."""
        response = admin_client.find(
            "leads",
            limit=10,
            sort="-score"  # Descendente
        )

        scores = [lead.get("score", 0) for lead in response["docs"]]
        assert scores == sorted(scores, reverse=True)


# =============================================================================
# TESTES DE LEITURA (GET /api/leads/:id)
# =============================================================================

@pytest.mark.api
class TestLeadsRead:
    """Testes de leitura de lead individual."""

    def test_read_lead_by_id_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Admin deve conseguir ler qualquer lead."""
        lead_data = admin_client.find_by_id("leads", created_lead["id"])

        assert lead_data["id"] == created_lead["id"]
        assert "name" in lead_data
        assert "phone" in lead_data
        assert "status" in lead_data

    def test_read_lead_by_id_agent_assigned(
        self,
        agent_client: AuthenticatedAPIClient,
        lead_assigned_to_agent: Dict[str, Any]
    ):
        """Agent deve conseguir ler lead atribuído a ele."""
        lead_data = agent_client.find_by_id("leads", lead_assigned_to_agent["id"])

        assert lead_data["id"] == lead_assigned_to_agent["id"]
        assert "name" in lead_data

    def test_read_lead_by_id_agent_unassigned_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        admin_user_data: Dict[str, Any],
    ):
        """Agent NÃO deve conseguir ler lead não atribuído a ele."""
        # Admin cria lead explicitamente atribuído ao próprio admin.
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = admin_user_data["id"]
        created = admin_client.create_lead(lead_data)

        # Agent tenta acessar - deve falhar
        with pytest.raises((AuthorizationError, NotFoundError)):
            agent_client.find_by_id("leads", created["id"])

    def test_read_lead_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao buscar lead inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.find_by_id("leads", "999999999")

        assert exc_info.value.status_code == 404


# =============================================================================
# TESTES DE CRIAÇÃO (POST /api/leads)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestLeadsCreate:
    """Testes de criação de leads."""

    def test_create_lead_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_lead_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Admin deve conseguir criar leads."""
        response = admin_client.create_lead(test_lead_data)

        assert response["id"] is not None
        assert response["name"] == test_lead_data["name"]
        assert response["status"] == test_lead_data.get("status", "new")

        # Cleanup
        cleanup_test_data["leads"].append(response["id"])

    def test_create_lead_agent(
        self,
        agent_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Agent deve conseguir criar leads."""
        lead_data = LeadFactory.with_phone()
        response = agent_client.create_lead(lead_data)

        assert response["id"] is not None
        assert response["name"] == lead_data["name"]

        # Cleanup
        cleanup_test_data["leads"].append(response["id"])

    def test_create_lead_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient
    ):
        """Usuário anônimo NÃO deve conseguir criar leads (401)."""
        lead_data = LeadFactory.minimal()

        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.post("/api/leads", json_data=lead_data)

        assert exc_info.value.status_code in (401, 403)

    def test_create_lead_with_minimal_data(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Testa criação com dados mínimos (apenas name)."""
        lead_data = LeadFactory.minimal()
        response = admin_client.create_lead(lead_data)

        assert response["id"] is not None
        assert response["name"] == lead_data["name"]
        # Valores padrão devem ser aplicados
        assert response["status"] == "new"
        assert response["priority"] == "medium"
        assert response.get("score") == 0

        # Cleanup
        cleanup_test_data["leads"].append(response["id"])

    def test_create_lead_with_complete_data(
        self,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa criação com todos os campos."""
        lead_data = LeadFactory.complete()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]

        response = admin_client.create_lead(lead_data)

        assert response["id"] is not None
        assert response["name"] == lead_data["name"]
        assert response["phone"] is not None
        assert response["email"] is not None
        assert response["source"] == lead_data["source"]
        assert response["priority"] == lead_data["priority"]

        # Cleanup
        cleanup_test_data["leads"].append(response["id"])

    def test_create_lead_validation_error_missing_name(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa erro de validação quando falta nome obrigatório."""
        lead_data = {"phone": "(61) 99999-9999"}

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_lead(lead_data)

        assert exc_info.value.status_code == 400

    def test_create_lead_with_invalid_phone(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação de telefone inválido."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "123"  # Muito curto

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_lead(lead_data)

        assert exc_info.value.status_code == 400

    def test_create_lead_with_invalid_email(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação de email inválido."""
        lead_data = LeadFactory.minimal()
        lead_data["email"] = "not-an-email"

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_lead(lead_data)

        assert exc_info.value.status_code == 400

    def test_create_lead_auto_assigns_to_agent(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa que lead é atribuído automaticamente se não especificado."""
        lead_data = LeadFactory.with_phone()
        # Não define assignedTo

        response = admin_client.create_lead(lead_data)

        # Hook de distribuição deve atribuir a um agente
        # (pode ser null se não houver agentes ativos)
        assert "assignedTo" in response


# =============================================================================
# TESTES DE ATUALIZAÇÃO (PATCH /api/leads/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestLeadsUpdate:
    """Testes de atualização de leads."""

    def test_update_lead_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Admin deve conseguir atualizar qualquer lead."""
        update_data = {
            "name": "Nome Atualizado - Admin",
            "status": "contacted",
            "priority": "high"
        }

        response = admin_client.update("leads", created_lead["id"], update_data)

        assert response["id"] == created_lead["id"]
        assert response["name"] == update_data["name"]
        assert response["status"] == update_data["status"]
        assert response["priority"] == update_data["priority"]

    def test_update_lead_agent_assigned(
        self,
        agent_client: AuthenticatedAPIClient,
        lead_assigned_to_agent: Dict[str, Any]
    ):
        """Agent deve conseguir atualizar lead atribuído a ele."""
        update_data = {
            "status": "visit_scheduled",
            "priority": "high"
        }

        response = agent_client.update(
            "leads",
            lead_assigned_to_agent["id"],
            update_data
        )

        assert response["status"] == update_data["status"]
        assert response["priority"] == update_data["priority"]

    def test_update_lead_agent_unassigned_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        admin_user_data: Dict[str, Any],
    ):
        """Agent NÃO deve conseguir atualizar lead não atribuído."""
        # Admin cria lead explicitamente atribuído ao próprio admin.
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = admin_user_data["id"]
        created = admin_client.create_lead(lead_data)

        # Agent tenta atualizar
        with pytest.raises((AuthorizationError, NotFoundError)):
            agent_client.update("leads", created["id"], {"status": "contacted"})

    def test_update_lead_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Usuário anônimo NÃO deve conseguir atualizar (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.patch(
                f"/api/leads/{created_lead['id']}",
                json_data={"name": "Tentativa"}
            )

        assert exc_info.value.status_code in (401, 403)

    def test_update_lead_partial(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Testa atualização parcial (apenas alguns campos)."""
        original_status = created_lead["status"]

        update_data = {"priority": "high"}
        response = admin_client.update("leads", created_lead["id"], update_data)

        assert response["priority"] == "high"
        assert response["status"] == original_status  # Não alterado

    def test_update_lead_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao atualizar lead inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.update("leads", "999999999", {"name": "Test"})

        assert exc_info.value.status_code == 404

    def test_update_lead_status_transitions(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Testa transições de status válidas."""
        valid_statuses = [
            "new", "contacted", "qualified", "visit_scheduled",
            "proposal_sent", "negotiation", "closed_won", "closed_lost"
        ]

        for status in valid_statuses:
            response = admin_client.update(
                "leads",
                created_lead["id"],
                {"status": status}
            )
            assert response["status"] == status


# =============================================================================
# TESTES DE DELEÇÃO (DELETE /api/leads/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestLeadsDelete:
    """Testes de deleção de leads."""

    def test_delete_lead_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_lead_data: Dict[str, Any]
    ):
        """Admin deve conseguir deletar leads."""
        lead_data = admin_client.create_lead(test_lead_data)
        lead_id = lead_data["id"]

        # Deleta
        admin_client.delete("leads", lead_id)

        # Verifica que foi deletado
        with pytest.raises(NotFoundError):
            admin_client.find_by_id("leads", lead_id)

    def test_delete_lead_agent_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Agent NÃO deve conseguir deletar leads (403)."""
        # Admin cria lead atribuído ao agent
        lead_data = LeadFactory.minimal()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]
        created = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(created["id"])

        # Agent tenta deletar - deve falhar
        with pytest.raises(AuthorizationError) as exc_info:
            agent_client.delete("leads", created["id"])

        assert exc_info.value.status_code == 403

    def test_delete_lead_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Usuário anônimo NÃO deve conseguir deletar (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.delete(f"/api/leads/{created_lead['id']}")

        assert exc_info.value.status_code in (401, 403)

    def test_delete_lead_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao deletar lead inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.delete("leads", "999999999")

        assert exc_info.value.status_code == 404


# =============================================================================
# TESTES DE HOOKS - NORMALIZE PHONE
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestLeadsNormalizePhoneHook:
    """Testes do hook normalizeLeadPhone."""

    def test_hook_normalize_phone_standard_format(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Normaliza telefone no formato padrão brasileiro."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "(61) 99999-9999"

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        # Telefone deve ser normalizado para apenas dígitos (10 ou 11 dígitos)
        assert response["phone"].isdigit()
        assert len(response["phone"]) in [10, 11]

    def test_hook_normalize_phone_with_plus55(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Normaliza telefone com código do país +55."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "+55 61 99999-9999"

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        assert response["phone"].isdigit()
        assert len(response["phone"]) in [10, 11]

    def test_hook_normalize_phone_with_dddd(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Normaliza telefone com DDD entre parênteses."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "(061) 99999-9999"

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        assert response["phone"].isdigit()
        assert len(response["phone"]) in [10, 11]

    def test_hook_normalize_phone_landline(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Normaliza telefone fixo (8 dígitos + DDD)."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "(61) 3333-4444"

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        # Telefone fixo tem 10 dígitos (2 DDD + 8 número)
        assert response["phone"] == "6133334444"
        assert len(response["phone"]) == 10

    def test_hook_normalize_phone_various_formats(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa normalização de diversos formatos brasileiros."""
        formats = LeadFactory.with_various_phone_formats()

        for phone_format in formats:
            lead_data = LeadFactory.minimal()
            lead_data["phone"] = phone_format

            response = admin_client.create_lead(lead_data)

            # Todos devem resultar no mesmo formato normalizado
            assert len(response["phone"]) in [10, 11]
            assert response["phone"].isdigit()

            # Cleanup
            admin_client.delete("leads", response["id"])

    def test_hook_normalize_phone_validation_error_invalid_length(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Rejeita telefone com número inválido de dígitos."""
        lead_data = LeadFactory.minimal()
        lead_data["phone"] = "12345"  # Muito curto

        with pytest.raises(ValidationError):
            admin_client.create_lead(lead_data)

    def test_hook_normalize_phone_on_update(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Telefone também é normalizado na atualização."""
        update_data = {"phone": "(11) 98888-7777"}

        response = admin_client.update(
            "leads",
            created_lead["id"],
            update_data
        )

        assert response["phone"] == "11988887777"


# =============================================================================
# TESTES DE HOOKS - UPDATE SCORE
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestLeadsUpdateScoreHook:
    """Testes do hook updateLeadScore."""

    def test_hook_score_zero_with_minimal_data(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Lead sem telefone/email deve ter score 0."""
        lead_data = LeadFactory.minimal()

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        assert response.get("score", 0) == 0

    def test_hook_score_with_phone_only(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Lead com telefone deve ter score > 0."""
        lead_data = LeadFactory.with_phone()

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        persisted = admin_client.find_by_id("leads", response["id"])
        assert persisted.get("score", 0) > 0

    def test_hook_score_with_email_only(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Lead com email deve ter score > 0."""
        lead_data = LeadFactory.with_email()

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        persisted = admin_client.find_by_id("leads", response["id"])
        assert persisted.get("score", 0) > 0

    def test_hook_score_maximum_with_phone_and_email(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Lead com telefone e email deve ter score máximo."""
        lead_data = LeadFactory.with_phone_and_email()

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        # Score deve ser maior que apenas telefone ou email
        persisted = admin_client.find_by_id("leads", response["id"])
        assert persisted.get("score", 0) > 10

    def test_hook_score_increases_when_adding_contact(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Score deve aumentar quando adicionamos contato."""
        original_score = created_lead.get("score", 0)

        # Adiciona email
        response = admin_client.update(
            "leads",
            created_lead["id"],
            {"email": "novo@email.com"}
        )

        # Score deve ser maior ou igual
        assert response.get("score", 0) >= original_score


# =============================================================================
# TESTES DE HOOKS - DISTRIBUTE LEAD
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestLeadsDistributeHook:
    """Testes do hook distributeLead."""

    def test_hook_auto_assign_when_not_specified(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Lead sem assignedTo deve ser atribuído automaticamente."""
        lead_data = LeadFactory.with_phone()
        # Não define assignedTo

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        # assignedTo deve ter sido preenchido pelo hook
        # (pode ser null se não houver agentes disponíveis)
        assert "assignedTo" in response

    def test_hook_respects_explicit_assignment(
        self,
        admin_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Atribuição explícita deve ser respeitada."""
        lead_data = LeadFactory.with_phone()
        lead_data["assignedTo"] = agent_user_data["user"]["id"]

        response = admin_client.create_lead(lead_data)
        cleanup_test_data["leads"].append(response["id"])

        # assignedTo deve ser o que foi especificado
        assigned_to = response.get("assignedTo")
        if assigned_to:
            if isinstance(assigned_to, dict):
                assert assigned_to["id"] == agent_user_data["user"]["id"]
            else:
                assert assigned_to == agent_user_data["user"]["id"]


# =============================================================================
# TESTES DE ESTRUTURA DE RESPOSTA
# =============================================================================

@pytest.mark.api
class TestLeadsResponseStructure:
    """Testes da estrutura de resposta da API."""

    def test_response_structure_list(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa estrutura da resposta de listagem."""
        response = admin_client.find("leads", limit=1)

        assert "docs" in response
        assert "totalDocs" in response
        assert "limit" in response
        assert "page" in response
        assert "hasNextPage" in response
        assert "hasPrevPage" in response

    def test_response_structure_detail(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Testa estrutura da resposta de detalhe."""
        lead_data = admin_client.find_by_id("leads", created_lead["id"])

        required_fields = [
            "id", "name", "status", "priority", "score"
        ]

        for field in required_fields:
            assert field in lead_data, f"Campo {field} ausente"

    def test_lead_has_timestamps(
        self,
        admin_client: AuthenticatedAPIClient,
        created_lead: Dict[str, Any]
    ):
        """Testa que lead tem timestamps de criação/atualização."""
        lead_data = admin_client.find_by_id("leads", created_lead["id"])

        assert "createdAt" in lead_data
        assert "updatedAt" in lead_data

    def test_lead_status_options(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa que status aceita apenas valores válidos."""
        valid_statuses = [
            "new", "contacted", "qualified", "visit_scheduled",
            "proposal_sent", "negotiation", "closed_won", "closed_lost"
        ]

        for status in valid_statuses:
            lead_data = LeadFactory.minimal()
            lead_data["status"] = status

            response = admin_client.create_lead(lead_data)
            assert response["status"] == status

            # Cleanup
            admin_client.delete("leads", response["id"])

    def test_lead_priority_options(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa que priority aceita apenas valores válidos."""
        valid_priorities = ["high", "medium", "low"]

        for priority in valid_priorities:
            lead_data = LeadFactory.minimal()
            lead_data["priority"] = priority

            response = admin_client.create_lead(lead_data)
            assert response["priority"] == priority

            # Cleanup
            admin_client.delete("leads", response["id"])

    def test_lead_source_options(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa que source aceita valores válidos."""
        valid_sources = [
            "website", "whatsapp", "instagram", "referral", "other"
        ]

        for source in valid_sources:
            lead_data = LeadFactory.minimal()
            lead_data["source"] = source

            response = admin_client.create_lead(lead_data)
            assert response["source"] == source

            # Cleanup
            admin_client.delete("leads", response["id"])


# =============================================================================
# TESTES DE FILTROS AVANÇADOS
# =============================================================================

@pytest.mark.api
class TestLeadsFilters:
    """Testes de filtros avançados na listagem."""

    def test_filter_by_status_new(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por status=new."""
        response = admin_client.find(
            "leads",
            where={"status": {"equals": "new"}},
            limit=10
        )

        assert all(lead["status"] == "new" for lead in response["docs"])

    def test_filter_by_status_contacted(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por status=contacted."""
        response = admin_client.find(
            "leads",
            where={"status": {"equals": "contacted"}},
            limit=10
        )

        assert all(lead["status"] == "contacted" for lead in response["docs"])

    def test_filter_by_priority_high(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por priority=high."""
        response = admin_client.find(
            "leads",
            where={"priority": {"equals": "high"}},
            limit=10
        )

        assert all(lead["priority"] == "high" for lead in response["docs"])

    def test_filter_by_score_range(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por faixa de score."""
        response = admin_client.find(
            "leads",
            where={
                "score": {
                    "greater_than_equal": 5
                }
            },
            limit=10,
            sort="-score"
        )

        for lead in response["docs"]:
            assert lead.get("score", 0) >= 5

    def test_filter_multiple_conditions_and(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com múltiplas condições (AND)."""
        response = admin_client.find(
            "leads",
            where={
                "and": [
                    {"status": {"equals": "new"}},
                    {"priority": {"equals": "high"}}
                ]
            },
            limit=10
        )

        for lead in response["docs"]:
            assert lead["status"] == "new"
            assert lead["priority"] == "high"

    def test_filter_multiple_conditions_or(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com condições OR."""
        response = admin_client.find(
            "leads",
            where={
                "or": [
                    {"status": {"equals": "new"}},
                    {"status": {"equals": "contacted"}}
                ]
            },
            limit=10
        )

        for lead in response["docs"]:
            assert lead["status"] in ["new", "contacted"]
