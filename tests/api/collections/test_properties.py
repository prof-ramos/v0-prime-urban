"""
Testes CRUD completos para collection Properties.

Este módulo testa todas as operações CRUD da collection Properties:
- GET /api/properties (list)
- GET /api/properties/:id (read)
- POST /api/properties (create) - requires auth
- PATCH /api/properties/:id (update) - requires auth
- DELETE /api/properties/:id (delete) - requires admin
- Filtros avançados (where clause)
"""

import pytest
import json
import requests
import base64
from typing import Dict, Any

from tests.api.utils import (
    AuthenticatedAPIClient,
    AnonymousAPIClient,
    AuthorizationError,
    AuthenticationError,
    NotFoundError,
    ValidationError,
    build_where_clause,
)
from tests.api.fixtures import PropertyFactory


# =============================================================================
# FIXTURES ESPECÍFICOS PARA PROPERTIES
# =============================================================================

@pytest.fixture(scope="function")
def test_media(
    admin_client: AuthenticatedAPIClient,
    admin_token: str
) -> Dict[str, Any]:
    """
    Cria uma mídia de teste para usar nas propriedades.

    Returns:
        Dict com dados da mídia criada
    """
    # Tenta encontrar mídia existente com filename esperado
    try:
        response = admin_client.find(
            "media",
            where={"filename": {"equals": "test-property-image.jpg"}},
            limit=1
        )
        if response.get("docs"):
            return response["docs"][0]
    except Exception:
        pass

    # Fallback: reutiliza qualquer mídia existente
    try:
        media_list = admin_client.find("media", limit=1)
        if media_list.get("docs"):
            return media_list["docs"][0]
    except Exception:
        pass

    # Último fallback: cria mídia via multipart upload
    one_pixel_png_base64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5n7NwAAAAASUVORK5CYII="
    )
    image_bytes = base64.b64decode(one_pixel_png_base64)

    upload_response = requests.post(
        "http://localhost:3000/api/media",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={"_payload": json.dumps({"alt": "Imagem de teste para propriedade"})},
        files={"file": ("test-property-image.jpg", image_bytes, "image/png")},
        timeout=30,
    )
    assert upload_response.status_code in (200, 201), upload_response.text
    payload = upload_response.json()
    return payload.get("doc", payload)


@pytest.fixture(scope="function")
def test_property_data(
    test_neighborhood: Dict[str, Any],
    test_media: Dict[str, Any],
    admin_user_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria dados válidos para uma propriedade de teste.

    Returns:
        Dict com dados da propriedade
    """
    return PropertyFactory.minimal(
        neighborhood_id=test_neighborhood["id"],
        media_id=test_media["id"],
        agent_id=admin_user_data["id"]
    )


@pytest.fixture(scope="function")
def created_property(
    admin_client: AuthenticatedAPIClient,
    test_property_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cria uma propriedade e garante cleanup após o teste.

    Yields:
        Dict com propriedade criada
    """
    property_data = admin_client.create_property(test_property_data)
    yield property_data

    # Cleanup
    try:
        admin_client.delete("properties", property_data["id"])
    except Exception:
        pass  # Ignora erros no cleanup


# =============================================================================
# TESTES DE LISTAGEM (GET /api/properties)
# =============================================================================

@pytest.mark.api
@pytest.mark.smoke
class TestPropertiesList:
    """Testes de listagem de propriedades."""

    def test_list_properties_anonymous(self, anonymous_client: AnonymousAPIClient):
        """Testa listagem pública de propriedades (read: true)."""
        response = anonymous_client.get("/api/properties")

        assert response.status_code == 200
        assert "docs" in response.data
        assert "totalDocs" in response.data
        assert isinstance(response.data["docs"], list)

    def test_list_properties_authenticated(self, admin_client: AuthenticatedAPIClient):
        """Testa listagem de propriedades autenticado."""
        response = admin_client.find("properties", limit=10)

        assert response.data["totalDocs"] >= 0
        assert len(response.data["docs"]) <= 10
        assert "docs" in response.data
        assert "totalDocs" in response.data

    def test_list_properties_with_pagination(self, admin_client: AuthenticatedAPIClient):
        """Testa paginação na listagem de propriedades."""
        # Primeira página
        page1 = admin_client.find("properties", page=1, limit=5)
        assert len(page1["docs"]) <= 5
        assert page1["page"] == 1

        # Segunda página (se houver suficientes)
        if page1["totalDocs"] > 5:
            page2 = admin_client.find("properties", page=2, limit=5)
            assert page2["page"] == 2

    def test_list_properties_with_depth(self, admin_client: AuthenticatedAPIClient):
        """Testa populate de relacionamentos com depth."""
        response = admin_client.find("properties", depth=1, limit=1)

        if response["docs"]:
            prop = response["docs"][0]
            # Com depth=1, relacionamentos devem ser populados
            if "neighborhood" in prop.get("address", {}):
                neighborhood = prop["address"]["neighborhood"]
                # Pode ser objeto populado ou apenas ID
                assert isinstance(neighborhood, (dict, str))

    def test_list_properties_empty_result(self, admin_client: AuthenticatedAPIClient):
        """Testa query que retorna resultados vazios."""
        response = admin_client.find(
            "properties",
            where={"code": {"equals": "NONEXISTENT-CODE-12345"}},
            limit=10
        )

        assert response["totalDocs"] == 0
        assert len(response["docs"]) == 0


# =============================================================================
# TESTES DE LEITURA (GET /api/properties/:id)
# =============================================================================

@pytest.mark.api
class TestPropertiesRead:
    """Testes de leitura de propriedade individual."""

    def test_read_property_by_id_anonymous(
        self,
        anonymous_client: AnonymousAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa leitura pública de propriedade por ID."""
        response = anonymous_client.get(f"/api/properties/{created_property['id']}")

        assert response.status_code == 200
        assert response.data["id"] == created_property["id"]
        assert "title" in response.data
        assert "price" in response.data

    def test_read_property_by_id_authenticated(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa leitura autenticada de propriedade por ID."""
        property_data = admin_client.find_by_id("properties", created_property["id"])

        assert property_data["id"] == created_property["id"]
        assert "title" in property_data
        assert "code" in property_data
        assert "slug" in property_data

    def test_read_property_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao buscar propriedade inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.find_by_id("properties", "999999999")

        assert exc_info.value.status_code == 404

    def test_read_property_with_depth(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa leitura com populate de relacionamentos."""
        property_data = admin_client.find_by_id(
            "properties",
            created_property["id"],
            depth=1
        )

        assert property_data["id"] == created_property["id"]
        # Verifica que relacionamentos foram populados
        if "agent" in property_data and property_data["agent"]:
            agent = property_data["agent"]
            assert isinstance(agent, dict)
            assert "id" in agent


# =============================================================================
# TESTES DE CRIAÇÃO (POST /api/properties)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestPropertiesCreate:
    """Testes de criação de propriedades."""

    def test_create_property_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa criação de propriedade por admin."""
        response = admin_client.create_property(test_property_data)

        assert response["id"] is not None
        assert response["title"] == test_property_data["title"]
        assert response["type"] == test_property_data["type"]
        assert response["category"] == test_property_data["category"]
        assert response["price"] == test_property_data["price"]
        assert "code" in response  # Gerado automaticamente
        assert "slug" in response  # Gerado automaticamente

        # Cleanup
        cleanup_test_data["properties"].append(response["id"])

    def test_create_property_agent(
        self,
        agent_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa criação de propriedade por agent (role permitido)."""
        response = agent_client.create_property(test_property_data)

        assert response["id"] is not None
        assert response["title"] == test_property_data["title"]

        # Cleanup
        cleanup_test_data["properties"].append(response["id"])

    def test_create_property_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        test_property_data: Dict[str, Any]
    ):
        """Testa que anônimo NÃO pode criar propriedade (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.post("/api/properties", json_data=test_property_data)

        assert exc_info.value.status_code in (401, 403)

    def test_create_property_validation_error_required_fields(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa erro de validação quando faltam campos obrigatórios."""
        incomplete_data = {
            "title": "Teste",
            # Faltam: type, category, price, address, featuredImage, agent
        }

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_property(incomplete_data)

        assert exc_info.value.status_code == 400

    def test_create_property_with_complete_data(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        test_media: Dict[str, Any],
        admin_user_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa criação com dados completos."""
        complete_data = PropertyFactory.complete(
            neighborhood_id=test_neighborhood["id"],
            media_id=test_media["id"],
            agent_id=admin_user_data["id"]
        )

        response = admin_client.create_property(complete_data)

        assert response["id"] is not None
        assert response["title"] == complete_data["title"]
        assert response["status"] == complete_data["status"]

        # Cleanup
        cleanup_test_data["properties"].append(response["id"])

    def test_create_property_auto_generated_fields(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa que code e slug são gerados automaticamente."""
        # Envia dados sem code e slug (vazios)
        test_property_data["code"] = ""
        test_property_data["slug"] = ""

        response = admin_client.create_property(test_property_data)

        assert response["code"] is not None
        assert response["code"].startswith("PRM-")
        assert response["slug"] is not None
        assert len(response["slug"]) > 0

        # Cleanup
        cleanup_test_data["properties"].append(response["id"])

    def test_create_property_invalid_price(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        test_media: Dict[str, Any],
        admin_user_data: Dict[str, Any]
    ):
        """Testa validação de preço acima do limite."""
        invalid_data = PropertyFactory.minimal(
            neighborhood_id=test_neighborhood["id"],
            media_id=test_media["id"],
            agent_id=admin_user_data["id"]
        )
        invalid_data["price"] = 9999999999  # Acima do limite

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_property(invalid_data)

        assert exc_info.value.status_code == 400

    def test_create_property_duplicate_code(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa que código duplicado gera erro."""
        # Cria primeira propriedade
        prop1 = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(prop1["id"])

        # Tenta criar com mesmo código
        test_property_data["code"] = prop1["code"]

        with pytest.raises(ValidationError) as exc_info:
            admin_client.create_property(test_property_data)

        assert exc_info.value.status_code == 409 or exc_info.value.status_code == 400


# =============================================================================
# TESTES DE ATUALIZAÇÃO (PATCH /api/properties/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestPropertiesUpdate:
    """Testes de atualização de propriedades."""

    def test_update_property_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa atualização por admin."""
        update_data = {
            "title": "Título Atualizado - Teste",
            "price": 999999,
            "status": "published",
        }

        response = admin_client.update("properties", created_property["id"], update_data)

        assert response["id"] == created_property["id"]
        assert response["title"] == update_data["title"]
        assert response["price"] == update_data["price"]
        assert response["status"] == update_data["status"]

    def test_update_property_agent(
        self,
        agent_client: AuthenticatedAPIClient,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa atualização por agent (role permitido)."""
        created = admin_client.create_property(test_property_data)
        property_id = created["id"]
        cleanup_test_data["properties"].append(property_id)

        # Atualiza como agent
        update_data = {"title": "Atualizado por Agent"}
        response = agent_client.update("properties", property_id, update_data)

        assert response["title"] == update_data["title"]

    def test_update_property_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa que anônimo NÃO pode atualizar (401)."""
        update_data = {"title": "Tentativa de Atualização"}

        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.patch(
                f"/api/properties/{created_property['id']}",
                json_data=update_data
            )

        assert exc_info.value.status_code in (401, 403)

    def test_update_property_readonly_fields(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa que campos readOnly não podem ser alterados."""
        original_code = created_property["code"]
        original_slug = created_property["slug"]

        # Tenta alterar campos readOnly
        update_data = {
            "code": "NOVO-CODE",
            "slug": "novo-slug",
            "title": "Título Atualizado"
        }

        response = admin_client.update("properties", created_property["id"], update_data)

        # Campos readOnly devem permanecer inalterados (ignorados pelo Payload)
        assert response["code"] == original_code
        assert response["slug"] == original_slug
        assert response["title"] == update_data["title"]

    def test_update_property_partial(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa atualização parcial (apenas alguns campos)."""
        original_price = created_property["price"]

        update_data = {"title": "Apenas Título Alterado"}
        response = admin_client.update("properties", created_property["id"], update_data)

        assert response["title"] == update_data["title"]
        assert response["price"] == original_price  # Não alterado

    def test_update_property_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao atualizar propriedade inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.update("properties", "999999999", {"title": "Test"})

        assert exc_info.value.status_code == 404

    def test_update_property_validation_error(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa erro de validação ao atualizar com dados inválidos."""
        invalid_data = {"price": -100}  # Preço negativo

        with pytest.raises(ValidationError) as exc_info:
            admin_client.update("properties", created_property["id"], invalid_data)

        assert exc_info.value.status_code == 400


# =============================================================================
# TESTES DE DELEÇÃO (DELETE /api/properties/:id)
# =============================================================================

@pytest.mark.api
@pytest.mark.rbac
class TestPropertiesDelete:
    """Testes de deleção de propriedades."""

    def test_delete_property_admin(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any]
    ):
        """Testa deleção por admin."""
        # Cria propriedade
        property_data = admin_client.create_property(test_property_data)
        property_id = property_data["id"]

        # Deleta
        admin_client.delete("properties", property_id)

        # Verifica que foi deletada
        with pytest.raises(NotFoundError):
            admin_client.find_by_id("properties", property_id)

    def test_delete_property_agent_forbidden(
        self,
        agent_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        admin_client: AuthenticatedAPIClient,
        cleanup_test_data
    ):
        """Testa que agent NÃO pode deletar (403 - apenas admin)."""
        # Cria propriedade via admin
        property_data = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(property_data["id"])

        # Tenta deletar como agent
        with pytest.raises(AuthorizationError) as exc_info:
            agent_client.delete("properties", property_data["id"])

        assert exc_info.value.status_code == 403

    def test_delete_property_anonymous_forbidden(
        self,
        anonymous_client: AnonymousAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa que anônimo NÃO pode deletar (401)."""
        with pytest.raises(AuthenticationError) as exc_info:
            anonymous_client.delete(f"/api/properties/{created_property['id']}")

        assert exc_info.value.status_code in (401, 403)

    def test_delete_property_not_found(self, admin_client: AuthenticatedAPIClient):
        """Testa 404 ao deletar propriedade inexistente."""
        with pytest.raises(NotFoundError) as exc_info:
            admin_client.delete("properties", "999999999")

        assert exc_info.value.status_code == 404


# =============================================================================
# TESTES DE FILTROS (WHERE CLAUSE)
# =============================================================================

@pytest.mark.api
class TestPropertiesFilters:
    """Testes de filtros avançados na listagem de propriedades."""

    def test_filter_by_status(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa filtro por status."""
        # Busca propriedades com status draft
        response = admin_client.find(
            "properties",
            where={"status": {"equals": "draft"}},
            limit=10
        )

        assert all(p["status"] == "draft" for p in response["docs"])

    def test_filter_by_type(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa filtro por tipo (sale/rent)."""
        # Cria propriedade de venda
        sale_property = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(sale_property["id"])

        # Filtra por tipo
        response = admin_client.find(
            "properties",
            where={"type": {"equals": "sale"}},
            limit=10
        )

        assert all(p["type"] == "sale" for p in response["docs"])

    def test_filter_by_category(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por categoria (apartment, house, etc)."""
        response = admin_client.find(
            "properties",
            where={"category": {"equals": "apartment"}},
            limit=10
        )

        assert all(p["category"] == "apartment" for p in response["docs"])

    def test_filter_by_price_range(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por faixa de preço."""
        response = admin_client.find(
            "properties",
            where={
                "and": [
                    {"price": {"greater_than_equal": 300000}},
                    {"price": {"less_than_equal": 1000000}}
                ]
            },
            limit=10,
            sort="price"
        )

        for prop in response["docs"]:
            assert 300000 <= prop["price"] <= 1000000

    def test_filter_by_price_greater_than(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro por preço maior que."""
        min_price = 500000
        response = admin_client.find(
            "properties",
            where={"price": {"greater_than": min_price}},
            limit=10,
            sort="price"
        )

        assert all(p["price"] > min_price for p in response["docs"])

    def test_filter_by_neighborhood(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa filtro por bairro."""
        # Cria propriedade no bairro de teste
        property_data = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(property_data["id"])

        # Filtra por bairro (via address.neighborhood)
        response = admin_client.find(
            "properties",
            where={
                "address.neighborhood": {
                    "equals": test_neighborhood["id"]
                }
            },
            depth=0,
            limit=10
        )

        # Pelo menos a propriedade criada deve estar nos resultados
        assert len(response["docs"]) >= 1

    def test_filter_multiple_conditions(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com múltiplas condições (AND)."""
        response = admin_client.find(
            "properties",
            where={
                "and": [
                    {"status": {"equals": "published"}},
                    {"type": {"equals": "sale"}},
                    {"category": {"equals": "apartment"}}
                ]
            },
            limit=10
        )

        for prop in response["docs"]:
            assert prop["status"] == "published"
            assert prop["type"] == "sale"
            assert prop["category"] == "apartment"

    def test_filter_or_conditions(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa filtro com condições OR."""
        response = admin_client.find(
            "properties",
            where={
                "or": [
                    {"status": {"equals": "published"}},
                    {"status": {"equals": "sold"}}
                ]
            },
            limit=10
        )

        for prop in response["docs"]:
            assert prop["status"] in ["published", "sold"]

    def test_filter_by_text_search(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa busca por texto (searchable fields)."""
        # Busca pelo título da propriedade criada
        search_term = created_property["title"][:10]  # Primeiros caracteres

        response = admin_client.find(
            "properties",
            where={
                "title": {"like": search_term}
            },
            limit=10
        )

        # Deve encontrar pelo menos a propriedade criada
        assert len(response["docs"]) >= 1

    def test_sort_by_price_asc(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa ordenação por preço ascendente."""
        response = admin_client.find(
            "properties",
            limit=10,
            sort="price"
        )

        prices = [p["price"] for p in response["docs"]]
        assert prices == sorted(prices)

    def test_sort_by_price_desc(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa ordenação por preço descendente."""
        response = admin_client.find(
            "properties",
            limit=10,
            sort="-price"
        )

        prices = [p["price"] for p in response["docs"]]
        assert prices == sorted(prices, reverse=True)

    def test_sort_by_created_at(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa ordenação por data de criação."""
        response = admin_client.find(
            "properties",
            limit=10,
            sort="-createdAt"
        )

        # Verifica que estão ordenados por data
        timestamps = [p["createdAt"] for p in response["docs"] if "createdAt" in p]
        if len(timestamps) > 1:
            assert timestamps == sorted(timestamps, reverse=True)


# =============================================================================
# TESTES DE ESTRUTURA DE RESPOSTA
# =============================================================================

@pytest.mark.api
class TestPropertiesResponseStructure:
    """Testes da estrutura de resposta da API."""

    def test_response_structure_list(
        self,
        admin_client: AuthenticatedAPIClient
    ):
        """Testa estrutura da resposta de listagem."""
        response = admin_client.find("properties", limit=1)

        # Campos obrigatórios na resposta
        assert "docs" in response
        assert "totalDocs" in response
        assert "limit" in response
        assert "page" in response
        assert "pagingCounter" in response
        assert "hasNextPage" in response
        assert "hasPrevPage" in response

    def test_response_structure_detail(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa estrutura da resposta de detalhe."""
        property_data = admin_client.find_by_id("properties", created_property["id"])

        # Campos obrigatórios na propriedade
        required_fields = [
            "id", "title", "code", "slug", "type", "category",
            "status", "price", "shortDescription", "fullDescription",
            "address", "featuredImage", "agent"
        ]

        for field in required_fields:
            assert field in property_data, f"Campo {field} ausente na resposta"

    def test_property_has_timestamps(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa que propriedade tem timestamps de criação/atualização."""
        property_data = admin_client.find_by_id("properties", created_property["id"])

        assert "createdAt" in property_data
        assert "updatedAt" in property_data

    def test_property_address_structure(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any]
    ):
        """Testa estrutura do endereço da propriedade."""
        property_data = admin_client.find_by_id("properties", created_property["id"])
        address = property_data["address"]

        required_address_fields = ["street", "number", "neighborhood", "neighborhoodName"]
        for field in required_address_fields:
            assert field in address, f"Campo address.{field} ausente"


# =============================================================================
# TESTES DE RELACIONAMENTOS
# =============================================================================

@pytest.mark.api
class TestPropertiesRelationships:
    """Testes de relacionamentos da collection Properties."""

    def test_property_belongs_to_neighborhood(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any],
        test_neighborhood: Dict[str, Any]
    ):
        """Testa relacionamento com Neighborhoods."""
        property_data = admin_client.find_by_id(
            "properties",
            created_property["id"],
            depth=0
        )

        # Neighborhood deve estar presente no address
        assert "neighborhood" in property_data["address"]
        neighborhood = property_data["address"]["neighborhood"]

        # Com depth=0, pode ser apenas o ID
        if isinstance(neighborhood, dict):
            assert neighborhood["id"] == test_neighborhood["id"]
        else:
            assert neighborhood == test_neighborhood["id"]

    def test_property_belongs_to_agent(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any],
        admin_user_data: Dict[str, Any]
    ):
        """Testa relacionamento com Users (agent)."""
        property_data = admin_client.find_by_id(
            "properties",
            created_property["id"],
            depth=0
        )

        assert "agent" in property_data
        agent = property_data["agent"]

        if isinstance(agent, dict):
            assert agent["id"] == admin_user_data["id"]
        else:
            assert agent == admin_user_data["id"]

    def test_property_has_featured_image(
        self,
        admin_client: AuthenticatedAPIClient,
        created_property: Dict[str, Any],
        test_media: Dict[str, Any]
    ):
        """Testa relacionamento com Media (featuredImage)."""
        property_data = admin_client.find_by_id(
            "properties",
            created_property["id"],
            depth=0
        )

        assert "featuredImage" in property_data
        featured_image = property_data["featuredImage"]

        if isinstance(featured_image, dict):
            assert featured_image["id"] == test_media["id"]
        else:
            assert featured_image == test_media["id"]


# =============================================================================
# TESTES DE HOOKS
# =============================================================================

@pytest.mark.api
@pytest.mark.hooks
class TestPropertiesHooks:
    """Testes de hooks da collection Properties."""

    def test_hook_auto_slug_generation(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa hook de geração automática de slug a partir do título."""
        response = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(response["id"])

        # Slug deve ser derivado do título
        assert response["slug"] is not None
        assert len(response["slug"]) > 0
        # Slug deve ser URL-friendly (minúsculas, hífens)
        assert response["slug"].lower() == response["slug"]

    def test_hook_auto_code_generation(
        self,
        admin_client: AuthenticatedAPIClient,
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa hook de geração automática de código (PRM-XXX)."""
        test_property_data["code"] = ""  # Vazio para gerar automaticamente

        response = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(response["id"])

        assert response["code"] is not None
        assert response["code"].startswith("PRM-")

    def test_hook_neighborhood_name_sync(
        self,
        admin_client: AuthenticatedAPIClient,
        test_neighborhood: Dict[str, Any],
        test_property_data: Dict[str, Any],
        cleanup_test_data
    ):
        """Testa hook de sincronização do nome do bairro."""
        response = admin_client.create_property(test_property_data)
        cleanup_test_data["properties"].append(response["id"])

        # neighborhoodName deve ser preenchido automaticamente
        property_data = admin_client.find_by_id("properties", response["id"])
        neighborhood_name = property_data["address"]["neighborhoodName"]

        assert neighborhood_name is not None
        assert len(neighborhood_name) > 0
        # Deve corresponder ao nome do bairro relacionado
        assert neighborhood_name == test_neighborhood["name"]
