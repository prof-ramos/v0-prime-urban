"""
Testes CRUD completos para collection Users.

Este módulo testa todas as operações CRUD da collection Users:
- GET /api/users (list) - com RBAC (self ou admin)
- GET /api/users/:id (read) - com RBAC (self ou admin)
- POST /api/users (create) - admin only
- PATCH /api/users/:id (update) - self ou admin
- DELETE /api/users/:id (delete) - admin only
- Validações: email, phone, creci (para agents)
- Hooks: normalizeUserContactFields
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
from tests.api.fixtures import UserFactory


# =============================================================================
# FIXTURES ESPECÍFICOS PARA USERS
# =============================================================================

@pytest.fixture(scope="function")
def test_assistant_data() -> Dict[str, Any]:
    """Cria dados válidos para um usuário assistant."""
    return UserFactory.minimal(role="assistant")


@pytest.fixture(scope="function")
def test_agent_data() -> Dict[str, Any]:
    """Cria dados válidos para um usuário agent."""
    data = UserFactory.agent()
    data["creci"] = "DF-12345"
    return data


@pytest.fixture(scope="function")
def created_assistant(
    admin_client: AuthenticatedAPIClient,
    test_assistant_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria um usuário assistant e garante cleanup após o teste.

    Yields:
        Dict com usuário criado
    """
    user_data = admin_client.create("users", test_assistant_data)
    yield user_data

    # Cleanup
    try:
        admin_client.delete("users", user_data["id"])
    except Exception:
        pass


@pytest.fixture(scope="function")
def created_agent(
    admin_client: AuthenticatedAPIClient,
    test_agent_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria um usuário agent e garante cleanup após o teste.

    Yields:
        Dict com usuário criado
    """
    user_data = admin_client.create("users", test_agent_data)
    yield user_data

    # Cleanup
    try:
        admin_client.delete("users", user_data["id"])
    except Exception:
        pass


# =============================================================================
# TESTES DE LISTAGEM (GET /api/users)
# =============================================================================

@pytest.mark.api
@pytest.mark.smoke
class TestUsersList:
    """Testes de listagem de usuários."""

    def test_list_users_admin(self, admin_client: AuthenticatedAPIClient):
        """Admin deve conseguir listar todos os usuários."""
        response = admin_client.find("users", limit=10)

        assert "docs" in response
        assert "totalDocs" in response
        assert isinstance(response["docs"], list)

    def test_list_users_agent_sees_self_only(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Agent só deve conseguir ver a si mesmo na listagem."""
        response = agent_client.find("users", limit=100)

        # Deve ver apenas a si mesmo
        assert len(response["docs"]) == 1
        assert response["docs"][0]["id"] == agent_user_data["user"]["id"]

    def test_list_users_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient
    ):
        """Usuário anônimo NÃO deve conseguir listar usuários (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.get("/api/users")

        assert exc_info.value.status_code in (401, 403)

    def test_list_users_with_pagination(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa paginação na listagem de usuários."""
        page1 = admin_client.find("users", page=1, limit=5)
        assert len(page1["docs"]) <= 5
        assert page1["page"] == 1

        if page1["totalDocs"] > 5:
            page2 = admin_client.find("users", page=2, limit=5)
            assert page2["page"] == 2

    def test_list_users_filter_by_role(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por role."""
        response = admin_client.find(
            "users",
            where={"role": {"equals": "agent"}},
            limit=10
        )

        for user in response["docs"]:
            assert user["role"] == "agent"

    def test_list_users_filter_by_active(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por active."""
        response = admin_client.find(
            "users",
            where={"active": {"equals": True}},
            limit=10
        )

        for user in response["docs"]:
            assert user.get("active") is True

    def test_list_users_sort_by_name(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa ordenação por nome."""
        response = admin_client.find(
            "users",
            limit=10,
            sort="name"
        )

        names = [user.get("name", "") for user in response["docs"]]
        assert names == sorted(names)

    def test_list_users_me_endpoint(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Testa endpoint /me que retorna próprio usuário."""
        response = agent_client.get("/api/users/me")
        me_data = response.data.get("user", response.data)

        assert response.status_code == 200
        assert me_data["id"] == agent_user_data["user"]["id"]
        assert "email" in me_data
        assert "role" in me_data


# =============================================================================
# TESTES DE LEITURA (GET /api/users/:id)
# =============================================================================

@pytest.mark.api
class TestUsersRead:
    """Testes de leitura de usuário individual."""

    def test_read_user_by_id_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Admin deve conseguir ler qualquer usuário."""
        user_data = admin_client.find_by_id("users", created_assistant["id"])

        assert user_data["id"] == created_assistant["id"]
        assert user_data["email"] == created_assistant["email"]
        assert "name" in user_data
        assert "role" in user_data

    def test_read_user_by_id_self(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Usuário deve conseguir ler a si mesmo."""
        user_data = agent_client.find_by_id(
            "users",
            agent_user_data["user"]["id"]
        )

        assert user_data["id"] == agent_user_data["user"]["id"]
        assert "name" in user_data
        assert "email" in user_data

    def test_read_user_by_id_other_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Usuário NÃO deve conseguir ler outros usuários."""
        # Admin cria outro usuário
        user_data = UserFactory.minimal(role="assistant")
        created = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(created["id"])

        # Agent tenta acessar - deve falhar
        with pytest.raises((AuthorizationError, NotFoundError)):
            agent_client.find_by_id("users", created["id"])

    def test_read_user_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao buscar usuário inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.find_by_id("users", "999999999")

        assert exc_info.value.status_code == 404


# =============================================================================
# TESTES DE CRIAÇÃO (POST /api/users)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestUsersCreate:
    """Testes de criação de usuários."""

    def test_create_user_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_assistant_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Admin deve conseguir criar usuários."""
        response = admin_client.create("users", test_assistant_data)

        assert response["id"] is not None
        assert response["email"] == test_assistant_data["email"]
        assert response["name"] == test_assistant_data["name"]
        assert response["role"] == test_assistant_data["role"]

        # Cleanup
        cleanup_test_data["users"].append(response["id"])

    def test_create_user_admin_role(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Admin deve conseguir criar outros admins."""
        user_data = UserFactory.admin()
        response = admin_client.create("users", user_data)

        assert response["role"] == "admin"

        # Cleanup
        cleanup_test_data["users"].append(response["id"])

    def test_create_user_agent_with_creci(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Admin deve conseguir criar agent com CRECI."""
        user_data = UserFactory.agent()
        user_data["creci"] = "DF-12345"

        response = admin_client.create("users", user_data)

        assert response["role"] == "agent"
        # CRECI deve ser normalizado
        assert response["creci"] is not None
        assert "DF" in response["creci"].upper()

        # Cleanup
        cleanup_test_data["users"].append(response["id"])

    def test_create_user_agent_forbidden(
        self,
        agent_client: AuthenticatedAPIClient
    ):
        """Agent NÃO deve conseguir criar usuários (403)."""
        user_data = UserFactory.minimal(role="assistant")

        with pytest.raises(AuthorizationError) as exc_info:
            agent_client.create("users", user_data)

        assert exc_info.value.status_code == 403

    def test_create_user_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient
    ):
        """Usuário anônimo NÃO deve conseguir criar usuários (401)."""
        user_data = UserFactory.minimal(role="assistant")

        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.post("/api/users", json_data=user_data)

        assert exc_info.value.status_code in (401, 403)

    def test_create_user_validation_error_missing_email(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa erro de validação quando falta email obrigatório."""
        user_data = {
            "password": "TestPass123!",
            "name": "Test User",
            "role": "assistant"
        }

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create("users", user_data)

        assert exc_info.value.status_code == 400

    def test_create_user_validation_error_missing_password(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa erro de validação quando falta senha obrigatória."""
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "role": "assistant"
        }

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create("users", user_data)

        assert exc_info.value.status_code == 400

    def test_create_user_validation_error_duplicate_email(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Testa erro de validação para email duplicado."""
        user_data = {
            "email": created_assistant["email"],
            "password": "AnotherPass123!",
            "name": "Another User",
            "role": "assistant"
        }

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create("users", user_data)

        assert exc_info.value.status_code == 409 or exc_info.value.status_code == 400

    def test_create_user_validation_error_weak_password(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa erro de validação para senha fraca."""
        user_data = {
            "email": "weak@example.com",
            "password": "123",  # Muito curta
            "name": "Weak User",
            "role": "assistant"
        }

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create("users", user_data)

        assert exc_info.value.status_code == 400

    def test_create_user_agent_without_creci_forbidden(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Agent sem CRECI deve ser rejeitado."""
        user_data = UserFactory.agent()
        user_data["creci"] = None  # Sem CRECI

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create("users", user_data)

        assert exc_info.value.status_code == 400
        # Mensagem deve mencionar CRECI
        assert "creci" in str(exc_info.value.message).lower()

    def test_create_user_assistant_creci_cleared(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """CRECI deve ser limpo para não-agentes."""
        user_data = UserFactory.minimal(role="assistant")
        user_data["creci"] = "DF-12345"  # Tenta definir CRECI

        response = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(response["id"])

        # CRECI deve ser null para assistentes
        assert response.get("creci") is None


# =============================================================================
# TESTES DE ATUALIZAÇÃO (PATCH /api/users/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestUsersUpdate:
    """Testes de atualização de usuários."""

    def test_update_user_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Admin deve conseguir atualizar qualquer usuário."""
        update_data = {
            "name": "Nome Atualizado pelo Admin",
            "phone": "(61) 99999-9999",
            "active": True
        }

        response = admin_client.update(
            "users",
            created_assistant["id"],
            update_data
        )

        assert response["id"] == created_assistant["id"]
        assert response["name"] == update_data["name"]
        # Telefone deve ser normalizado
        assert len(response["phone"]) in [10, 11]

    def test_update_user_self(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Usuário deve conseguir atualizar a si mesmo."""
        user_id = agent_user_data["user"]["id"]

        update_data = {
            "name": "Meu Nome Atualizado",
            "phone": "(11) 98888-7777"
        }

        response = agent_client.update("users", user_id, update_data)

        assert response["name"] == update_data["name"]
        assert response["phone"] == "11988887777"  # Normalizado

    def test_update_user_other_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Usuário NÃO deve conseguir atualizar outros usuários."""
        # Admin cria outro usuário
        user_data = UserFactory.minimal(role="assistant")
        created = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(created["id"])

        # Agent tenta atualizar - deve falhar
        with pytest.raises((AuthorizationError, NotFoundError)):
            agent_client.update("users", created["id"], {"name": "Tentativa"})

    def test_update_user_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Usuário anônimo NÃO deve conseguir atualizar (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.patch(
                f"/api/users/{created_assistant['id']}",
                json_data={"name": "Tentativa"}
            )

        assert exc_info.value.status_code in (401, 403)

    def test_update_user_partial(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Testa atualização parcial (apenas alguns campos)."""
        original_email = created_assistant["email"]

        update_data = {"name": "Apenas Nome Alterado"}
        response = admin_client.update(
            "users",
            created_assistant["id"],
            update_data
        )

        assert response["name"] == update_data["name"]
        assert response["email"] == original_email  # Não alterado

    def test_update_user_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao atualizar usuário inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.update(
                "users",
                "999999999",
                {"name": "Test"}
            )

        assert exc_info.value.status_code == 404

    def test_update_user_role_admin_only(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Admin deve conseguir alterar role de usuário."""
        response = admin_client.update(
            "users",
            created_assistant["id"],
            {"role": "agent", "creci": "DF-12345"}
        )

        assert response["role"] == "agent"

    def test_update_user_role_forbidden_for_agent(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Agent não deve conseguir alterar o próprio role efetivamente."""
        user_id = agent_user_data["user"]["id"]

        # Tenta mudar para admin; atualização deve ser ignorada.
        response = agent_client.update("users", user_id, {"role": "admin"})
        assert response["role"] == "agent"

    def test_update_user_phone_normalization(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Telefone deve ser normalizado na atualização."""
        update_data = {"phone": "+55 (61) 9 9999-9999"}

        response = admin_client.update(
            "users",
            created_assistant["id"],
            update_data
        )

        assert response["phone"].isdigit()
        assert len(response["phone"]) in [10, 11]

    def test_update_user_add_creci_to_agent(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Adicionar CRECI a agent deve funcionar."""
        # Cria agent sem CRECI (via raw update)
        user_data = UserFactory.minimal(role="agent")
        user_data["creci"] = "DF-99999"
        created = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(created["id"])

        # Atualiza CRECI
        response = admin_client.update(
            "users",
            created["id"],
            {"creci": "SP-54321"}
        )

        assert "SP-54321" in response["creci"] or "SP54321" in response["creci"]


# =============================================================================
# TESTES DE DELEÇÃO (DELETE /api/users/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestUsersDelete:
    """Testes de deleção de usuários."""

    def test_delete_user_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_assistant_data: Dict[str, Any]
    ):
        """Admin deve conseguir deletar usuários."""
        user_data = admin_client.create("users", test_assistant_data)
        user_id = user_data["id"]

        # Deleta
        admin_client.delete("users", user_id)

        # Verifica que foi deletado
        with pytest.raises(NotFoundError):
            admin_client.find_by_id("users", user_id)

    def test_delete_user_agent_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Agent NÃO deve conseguir deletar usuários (403)."""
        # Admin cria outro usuário
        user_data = UserFactory.minimal(role="assistant")
        created = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(created["id"])

        # Agent tenta deletar - deve falhar
        with pytest.raises(AuthorizationError) as exc_info:
            agent_client.delete("users", created["id"])

        assert exc_info.value.status_code == 403

    def test_delete_user_self_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Usuário NÃO deve conseguir deletar a si mesmo."""
        user_id = agent_user_data["user"]["id"]

        with pytest.raises(AuthorizationError) as exc_info:
            agent_client.delete("users", user_id)

        assert exc_info.value.status_code == 403

    def test_delete_user_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Usuário anônimo NÃO deve conseguir deletar (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.delete(f"/api/users/{created_assistant['id']}")

        assert exc_info.value.status_code in (401, 403)

    def test_delete_user_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao deletar usuário inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.delete("users", "999999999")

        assert exc_info.value.status_code == 404


# =============================================================================
# TESTES DE HOOKS - NORMALIZE PHONE
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestUsersNormalizePhoneHook:
    """Testes do hook normalizeUserContactFields - telefone."""

    def test_hook_normalize_phone_on_create(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Telefone deve ser normalizado na criação."""
        user_data = UserFactory.minimal(role="assistant")
        user_data["phone"] = "(61) 99999-9999"

        response = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(response["id"])

        assert response["phone"].isdigit()
        assert len(response["phone"]) in [10, 11]

    def test_hook_normalize_phone_various_formats(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa normalização de diversos formatos."""
        formats = [
            "(61) 99999-9999",
            "61 99999 9999",
            "+55 61 99999-9999",
            "(061) 99999-9999",
        ]

        for phone_format in formats:
            user_data = UserFactory.minimal(role="assistant")
            user_data["phone"] = phone_format

            response = admin_client.create("users", user_data)

            # Todos devem resultar no mesmo formato normalizado
            assert len(response["phone"]) in [10, 11]
            assert response["phone"].isdigit()

            # Cleanup
            admin_client.delete("users", response["id"])

    def test_hook_normalize_phone_on_update(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Telefone também é normalizado na atualização."""
        update_data = {"phone": "(11) 8888-7777"}

        response = admin_client.update(
            "users",
            created_assistant["id"],
            update_data
        )

        # Fixo tem 10 dígitos
        assert response["phone"] == "1188887777"


# =============================================================================
# TESTES DE HOOKS - NORMALIZE CRECI
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestUsersNormalizeCreciHook:
    """Testes do hook normalizeUserContactFields - CRECI."""

    def test_hook_normalize_creci_on_create(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """CRECI deve ser normalizado na criação de agent."""
        user_data = UserFactory.agent()
        user_data["creci"] = "df-12345"

        response = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(response["id"])

        # CRECI deve ser uppercase
        assert response["creci"].upper() == response["creci"]
        assert "DF" in response["creci"] or "DF-" in response["creci"]

    def test_hook_normalize_creci_formats(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa normalização de diversos formatos de CRECI."""
        formats = [
            "df-12345",
            "DF12345",
            "12345-df",
            "12345DF",
        ]

        for creci_format in formats:
            user_data = UserFactory.agent()
            user_data["creci"] = creci_format

            response = admin_client.create("users", user_data)

            # Todos devem resultar em formato normalizado (uppercase)
            assert response["creci"] is not None
            assert "12345" in response["creci"]
            assert "DF" in response["creci"].upper()

            # Cleanup
            admin_client.delete("users", response["id"])

    def test_hook_creci_cleared_for_non_agent(
        self,
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """CRECI deve ser limpo para usuários não-agentes."""
        user_data = UserFactory.minimal(role="assistant")
        user_data["creci"] = "DF-12345"

        response = admin_client.create("users", user_data)
        cleanup_test_data["users"].append(response["id"])

        # CRECI deve ser null
        assert response.get("creci") is None

    def test_hook_creci_cleared_when_role_changes(
        self,
        admin_client: AuthenticatedAPIClient,
        created_agent: Dict[str, Any]
    ):
        """CRECI deve ser limpo quando role muda de agent para assistant."""
        # Agent tem CRECI
        assert created_agent.get("creci") is not None

        # Muda role para assistant
        response = admin_client.update(
            "users",
            created_agent["id"],
            {"role": "assistant"}
        )

        # CRECI deve ser null
        assert response.get("creci") is None


# =============================================================================
# TESTES DE VALIDAÇÃO DE CAMPOS
# =============================================================================

@pytest.mark.api
class TestUsersValidation:
    """Testes de validação de campos de usuário."""

    def test_validation_email_format(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação de formato de email."""
        invalid_emails = [
            "not-an-email",
            "@example.com",
            "user@",
            "user @example.com",
        ]

        for invalid_email in invalid_emails:
            user_data = UserFactory.minimal(role="assistant")
            user_data["email"] = invalid_email

            with pytest.raises(ValidationError):
                admin_client.create("users", user_data)

    def test_validation_phone_format(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação de formato de telefone."""
        user_data = UserFactory.minimal(role="assistant")
        user_data["phone"] = "123"  # Muito curto

        with pytest.raises(ValidationError):
            admin_client.create("users", user_data)

    def test_validation_password_strength(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação mínima de senha fraca (muito curta)."""
        weak_passwords = [
            "123",  # Muito curta
        ]

        for weak_password in weak_passwords:
            user_data = UserFactory.minimal(role="assistant")
            user_data["password"] = weak_password

            with pytest.raises(ValidationError):
                admin_client.create("users", user_data)

    def test_validation_creci_format_for_agent(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa validação de formato de CRECI para agent."""
        invalid_crecis = [
            "123",  # Muito curto
            "ABC",  # Sem números
        ]

        for invalid_creci in invalid_crecis:
            user_data = UserFactory.agent()
            user_data["creci"] = invalid_creci

            with pytest.raises(ValidationError):
                admin_client.create("users", user_data)


# =============================================================================
# TESTES DE ESTRUTURA DE RESPOSTA
# =============================================================================

@pytest.mark.api
class TestUsersResponseStructure:
    """Testes da estrutura de resposta da API."""

    def test_response_structure_list(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa estrutura da resposta de listagem."""
        response = admin_client.find("users", limit=1)

        assert "docs" in response
        assert "totalDocs" in response
        assert "limit" in response
        assert "page" in response
        assert "hasNextPage" in response
        assert "hasPrevPage" in response

    def test_response_structure_detail(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Testa estrutura da resposta de detalhe."""
        user_data = admin_client.find_by_id("users", created_assistant["id"])

        required_fields = [
            "id", "email", "name", "role", "active"
        ]

        for field in required_fields:
            assert field in user_data, f"Campo {field} ausente"

    def test_user_has_timestamps(
        self,
        admin_client: AuthenticatedAPIClient,
        created_assistant: Dict[str, Any]
    ):
        """Testa que usuário tem timestamps de criação/atualização."""
        user_data = admin_client.find_by_id("users", created_assistant["id"])

        assert "createdAt" in user_data
        assert "updatedAt" in user_data

    def test_user_role_values(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa que role aceita apenas valores válidos."""
        valid_roles = ["admin", "agent", "assistant"]

        for role in valid_roles:
            user_data = UserFactory.minimal(role=role)
            if role == "agent":
                user_data["creci"] = "DF-12345"

            response = admin_client.create("users", user_data)
            assert response["role"] == role

            # Cleanup
            admin_client.delete("users", response["id"])


# =============================================================================
# TESTES DE AUTENTICAÇÃO
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestUsersAuthentication:
    """Testes relacionados à autenticação de usuários."""

    def test_login_with_valid_credentials(
        self,
        anonymous_client: AnonymousAPIClient,
        payload_config: Dict[str, Any]
    ):
        """Login com credenciais válidas deve retornar token."""
        response = anonymous_client.login(
            email=payload_config["admin"]["email"],
            password=payload_config["admin"]["password"]
        )

        assert "token" in response
        assert "user" in response
        assert response["user"]["email"] == payload_config["admin"]["email"]

    def test_login_with_invalid_credentials(
        self,
        anonymous_client: AnonymousAPIClient
    ):
        """Login com credenciais inválidas deve falhar."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.login(
                email="invalid@example.com",
                password="wrongpassword"
            )

        assert exc_info.value.status_code in (401, 403)

    def test_login_with_wrong_password(
        self,
        anonymous_client: AnonymousAPIClient,
        payload_config: Dict[str, Any]
    ):
        """Login com senha errada deve falhar."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.login(
                email=payload_config["admin"]["email"],
                password="wrongpassword"
            )

        assert exc_info.value.status_code in (401, 403)

    def test_me_endpoint_returns_current_user(
        self,
        agent_client: AuthenticatedAPIClient,
        agent_user_data: Dict[str, Any]
    ):
        """Endpoint /me deve retornar usuário atual."""
        response = agent_client.get("/api/users/me")
        me_data = response.data.get("user", response.data)

        assert response.status_code == 200
        assert me_data["id"] == agent_user_data["user"]["id"]
        assert "email" in me_data
        assert "role" in me_data
        # Senha NÃO deve ser retornada
        assert "password" not in me_data


# =============================================================================
# TESTES DE FILTROS AVANÇADOS
# =============================================================================

@pytest.mark.api
class TestUsersFilters:
    """Testes de filtros avançados na listagem."""

    def test_filter_by_role_admin(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por role=admin."""
        response = admin_client.find(
            "users",
            where={"role": {"equals": "admin"}},
            limit=10
        )

        for user in response["docs"]:
            assert user["role"] == "admin"

    def test_filter_by_role_agent(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por role=agent."""
        response = admin_client.find(
            "users",
            where={"role": {"equals": "agent"}},
            limit=10
        )

        for user in response["docs"]:
            assert user["role"] == "agent"

    def test_filter_by_active_true(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por active=true."""
        response = admin_client.find(
            "users",
            where={"active": {"equals": True}},
            limit=10
        )

        for user in response["docs"]:
            assert user.get("active") is True

    def test_filter_by_name_like(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa busca por nome (like)."""
        response = admin_client.find(
            "users",
            where={"name": {"like": "Admin"}},
            limit=10
        )

        # Pelo menos o admin principal deve aparecer
        assert len(response["docs"]) >= 1

    def test_filter_multiple_conditions_and(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com múltiplas condições (AND)."""
        response = admin_client.find(
            "users",
            where={
                "and": [
                    {"role": {"equals": "assistant"}},
                    {"active": {"equals": True}}
                ]
            },
            limit=10
        )

        for user in response["docs"]:
            assert user["role"] == "assistant"
            assert user.get("active") is True

    def test_filter_multiple_conditions_or(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com condições OR."""
        response = admin_client.find(
            "users",
            where={
                "or": [
                    {"role": {"equals": "admin"}},
                    {"role": {"equals": "agent"}}
                ]
            },
            limit=10
        )

        for user in response["docs"]:
            assert user["role"] in ["admin", "agent"]
