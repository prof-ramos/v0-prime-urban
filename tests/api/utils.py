"""
Utilitários para testes de API do Payload CMS.

Contém classes e funções auxiliares para facilitar testes de API:
- AuthenticatedAPIClient: Client HTTP com autenticação JWT
- AnonymousAPIClient: Client HTTP sem autenticação
- Funções auxiliares para criação de dados de teste
"""

import requests
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum


# =============================================================================
# ENUMS
# =============================================================================

class HTTPMethod(Enum):
    """Métodos HTTP suportados."""
    GET = "GET"
    POST = "POST"
    PATCH = "PATCH"
    DELETE = "DELETE"


class CollectionType(Enum):
    """Collections do Payload CMS."""
    PROPERTIES = "properties"
    LEADS = "leads"
    USERS = "users"
    NEIGHBORHOODS = "neighborhoods"
    DEALS = "deals"
    ACTIVITIES = "activities"
    MEDIA = "media"


# =============================================================================
# CLASSES DE EXCEÇÃO
# =============================================================================

class APIError(Exception):
    """Erro base da API do Payload."""

    def __init__(self, message: str, status_code: int = None, response: dict = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)


class ValidationError(APIError):
    """Erro de validação (400)."""
    pass


class AuthenticationError(APIError):
    """Erro de autenticação (401)."""
    pass


class AuthorizationError(APIError):
    """Erro de autorização (403)."""
    pass


class NotFoundError(APIError):
    """Erro de recurso não encontrado (404)."""
    pass


class ConflictError(APIError):
    """Erro de conflito (409)."""
    pass


# =============================================================================
# CLIENT HTTP BASE
# =============================================================================

@dataclass
class APIResponse:
    """Resposta da API com metadados."""
    data: Dict[str, Any]
    status_code: int
    headers: Dict[str, str]

    @property
    def id(self) -> Optional[str]:
        """ID do recurso criado/atualizado."""
        return self.data.get("id")

    @property
    def docs(self) -> List[Dict[str, Any]]:
        """Lista de documentos (para queries)."""
        return self.data.get("docs", [])

    @property
    def total_docs(self) -> int:
        """Total de documentos (para queries paginadas)."""
        return self.data.get("totalDocs", 0)

    @property
    def has_error(self) -> bool:
        """Se a resposta contém erro."""
        return "errors" in self.data or self.status_code >= 400

    @property
    def errors(self) -> List[str]:
        """Lista de erros da resposta."""
        errors = self.data.get("errors", [])
        if isinstance(errors, list):
            return [str(e) for e in errors]
        return [str(errors)]


class APIData(dict):
    """Dict compatível com testes que acessam `.data`."""

    @property
    def data(self) -> "APIData":
        return self


def as_api_data(data: Dict[str, Any]) -> APIData:
    if isinstance(data, APIData):
        return data
    return APIData(data)


class BaseAPIClient:
    """
    Client HTTP base para API do Payload CMS.

    Fornece métodos comuns para fazer requests à API.
    """

    def __init__(self, base_url: str, timeout: int = 30):
        """
        Inicializa o client HTTP.

        Args:
            base_url: URL base da API (ex: http://localhost:3000)
            timeout: Timeout em segundos para requests
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json",
        })

    def _request(
        self,
        method: HTTPMethod,
        endpoint: str,
        params: dict = None,
        json_data: dict = None,
        **kwargs
    ) -> APIResponse:
        """
        Faz um request HTTP para a API.

        Args:
            method: Método HTTP
            endpoint: Endpoint da API (ex: /api/properties)
            params: Query parameters
            json_data: Body JSON
            **kwargs: Argumentos adicionais para requests

        Returns:
            APIResponse com dados da resposta

        Raises:
            APIError: Se o request falhar
        """
        url = f"{self.base_url}{endpoint}"

        try:
            response = self.session.request(
                method=method.value,
                url=url,
                params=params,
                json=json_data,
                timeout=self.timeout,
                **kwargs
            )

            # Tenta fazer parse do JSON
            try:
                data = response.json()
            except ValueError:
                data = {"text": response.text}

            api_response = APIResponse(
                data=data,
                status_code=response.status_code,
                headers=dict(response.headers)
            )

            # Levanta erro se status code for >= 400
            if response.status_code >= 400:
                self._raise_error(response.status_code, api_response)

            return api_response

        except requests.Timeout:
            raise APIError(f"Timeout após {self.timeout}s")
        except requests.ConnectionError:
            raise APIError(f"Erro de conexão com {url}")
        except requests.RequestException as e:
            raise APIError(f"Erro no request: {str(e)}")

    def _raise_error(self, status_code: int, response: APIResponse):
        """Levanta erro apropriado baseado no status code."""
        if status_code == 403 and "Authorization" not in self.session.headers:
            message = response.errors[0] if response.errors else response.data.get("message", "Erro desconhecido")
            raise AuthenticationError(message, status_code, response.data)

        error_map = {
            400: ValidationError,
            401: AuthenticationError,
            403: AuthorizationError,
            404: NotFoundError,
            409: ConflictError,
        }

        error_class = error_map.get(status_code, APIError)
        message = response.errors[0] if response.errors else response.data.get("message", "Erro desconhecido")
        raise error_class(message, status_code, response.data)

    def get(self, endpoint: str, params: dict = None, **kwargs) -> APIResponse:
        """Request GET."""
        return self._request(HTTPMethod.GET, endpoint, params=params, **kwargs)

    def post(self, endpoint: str, json_data: dict = None, **kwargs) -> APIResponse:
        """Request POST."""
        return self._request(HTTPMethod.POST, endpoint, json_data=json_data, **kwargs)

    def patch(self, endpoint: str, json_data: dict = None, **kwargs) -> APIResponse:
        """Request PATCH."""
        return self._request(HTTPMethod.PATCH, endpoint, json_data=json_data, **kwargs)

    def delete(self, endpoint: str, **kwargs) -> APIResponse:
        """Request DELETE."""
        return self._request(HTTPMethod.DELETE, endpoint, **kwargs)

    def close(self):
        """Fecha a session HTTP."""
        self.session.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()


# =============================================================================
# CLIENT AUTENTICADO
# =============================================================================

class AuthenticatedAPIClient(BaseAPIClient):
    """
    Client HTTP autenticado com JWT token.

    Usado para testar endpoints que requerem autenticação.
    """

    def __init__(self, base_url: str, token: str, timeout: int = 30):
        """
        Inicializa o client autenticado.

        Args:
            base_url: URL base da API
            token: JWT token de autenticação
            timeout: Timeout em segundos
        """
        super().__init__(base_url, timeout)
        self.token = token
        self.session.headers.update({
            "Authorization": f"Bearer {token}"
        })

    # -------------------------------------------------------------------------
    # MÉTODOS CONVENIENTES PARA COLLECTIONS
    # -------------------------------------------------------------------------

    @staticmethod
    def _unwrap_doc_payload(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normaliza respostas que podem vir como { doc: {...}, message: '...' }.
        """
        if isinstance(data, dict):
            doc = data.get("doc")
            if isinstance(doc, dict):
                return as_api_data(doc)
        return as_api_data(data)

    @classmethod
    def _flatten_payload_where(
        cls,
        prefix: str,
        value: Any,
        result: Dict[str, Any],
    ) -> None:
        if isinstance(value, dict):
            for key, nested in value.items():
                cls._flatten_payload_where(f"{prefix}[{key}]", nested, result)
            return

        if isinstance(value, list):
            for index, nested in enumerate(value):
                cls._flatten_payload_where(f"{prefix}[{index}]", nested, result)
            return

        result[prefix] = value

    @classmethod
    def _build_where_params(cls, where: Dict[str, Any]) -> Dict[str, Any]:
        params: Dict[str, Any] = {}
        cls._flatten_payload_where("where", where, params)
        return params

    def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo documento na collection.

        Args:
            collection: Nome da collection (ex: 'properties')
            data: Dados do documento

        Returns:
            Dict com documento criado (incluindo id)
        """
        response = self.post(f"/api/{collection}", json_data=data)
        return as_api_data(self._unwrap_doc_payload(response.data))

    def find(
        self,
        collection: str,
        where: Dict[str, Any] = None,
        sort: str = None,
        limit: int = None,
        page: int = None,
        depth: int = None
    ) -> Dict[str, Any]:
        """
        Busca documentos na collection.

        Args:
            collection: Nome da collection
            where: Filtros (Payload Query Syntax)
            sort: Ordenação (ex: '-createdAt')
            limit: Limite de resultados
            page: Página
            depth: Profundidade de populate

        Returns:
            Dict com docs, totalDocs, etc.
        """
        params = {}
        if where:
            params.update(self._build_where_params(where))
        if sort:
            params["sort"] = sort
        if limit:
            params["limit"] = limit
        if page:
            params["page"] = page
        if depth:
            params["depth"] = depth

        response = self.get(f"/api/{collection}", params=params)
        return as_api_data(response.data)

    def find_by_id(self, collection: str, id: str, depth: int = None) -> Dict[str, Any]:
        """
        Busca documento por ID.

        Args:
            collection: Nome da collection
            id: ID do documento
            depth: Profundidade de populate

        Returns:
            Dict com documento
        """
        params = {}
        if depth:
            params["depth"] = depth

        response = self.get(f"/api/{collection}/{id}", params=params)
        return as_api_data(self._unwrap_doc_payload(response.data))

    def update(self, collection: str, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza documento.

        Args:
            collection: Nome da collection
            id: ID do documento
            data: Dados para atualizar

        Returns:
            Dict com documento atualizado
        """
        response = self.patch(f"/api/{collection}/{id}", json_data=data)
        return as_api_data(self._unwrap_doc_payload(response.data))

    def delete(self, target: str, id: Optional[str] = None) -> Dict[str, Any]:
        """
        Deleta documento.

        Args:
            target: Nome da collection (ex: 'users') ou endpoint completo (ex: '/api/users/1')
            id: ID do documento quando target é collection
        """
        endpoint = target if id is None else f"/api/{target}/{id}"
        response = super().delete(endpoint)
        return as_api_data(self._unwrap_doc_payload(response.data))

    # -------------------------------------------------------------------------
    # MÉTODOS ESPECÍFICOS PARA COLLECTIONS
    # -------------------------------------------------------------------------

    def create_property(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova propriedade."""
        return self.create("properties", data)

    def find_properties(
        self,
        status: str = None,
        type: str = None,
        category: str = None,
        neighborhood: str = None,
        min_price: float = None,
        max_price: float = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Busca propriedades com filtros.

        Args:
            status: Filtro por status
            type: Filtro por tipo (sale/rent)
            category: Filtro por categoria
            neighborhood: Filtro por bairro (ID ou nome)
            min_price: Preço mínimo
            max_price: Preço máximo
            limit: Limite de resultados

        Returns:
            Dict com propriedades encontradas
        """
        where = {"and": []}

        if status:
            where["and"].append({"status": {"equals": status}})
        if type:
            where["and"].append({"type": {"equals": type}})
        if category:
            where["and"].append({"category": {"equals": category}})
        if neighborhood:
            where["and"].append({"neighborhood": {"equals": neighborhood}})
        if min_price:
            where["and"].append({"price": {"greater_than_equal": min_price}})
        if max_price:
            where["and"].append({"price": {"less_than_equal": max_price}})

        # Se não há filtros, não envia where
        query = {"limit": limit}
        if where["and"]:
            query["where"] = where

        return self.find("properties", **query)

    def create_lead(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo lead."""
        return self.create("leads", data)

    def find_leads(
        self,
        status: str = None,
        assigned_to: str = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Busca leads com filtros.

        Args:
            status: Filtro por status
            assigned_to: Filtro por agent (ID)
            limit: Limite de resultados

        Returns:
            Dict com leads encontrados
        """
        where = {"and": []}

        if status:
            where["and"].append({"status": {"equals": status}})
        if assigned_to:
            where["and"].append({"assignedTo": {"equals": assigned_to}})

        query = {"limit": limit, "sort": "-createdAt"}
        if where["and"]:
            query["where"] = where

        return self.find("leads", **query)

    def create_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo usuário."""
        return self.create("users", data)

    def find_users(self, role: str = None, limit: int = 10) -> Dict[str, Any]:
        """
        Busca usuários com filtros.

        Args:
            role: Filtro por role (admin/agent)
            limit: Limite de resultados

        Returns:
            Dict com usuários encontrados
        """
        if role:
            return self.find("users", where={"role": {"equals": role}}, limit=limit)
        return self.find("users", limit=limit)


# =============================================================================
# CLIENT ANÔNIMO
# =============================================================================

class AnonymousAPIClient(BaseAPIClient):
    """
    Client HTTP sem autenticação.

    Usado para testar endpoints públicos e verificar
    controles de acesso (RBAC).
    """

    def __init__(self, base_url: str, timeout: int = 30):
        """
        Inicializa o client anônimo.

        Args:
            base_url: URL base da API
            timeout: Timeout em segundos
        """
        super().__init__(base_url, timeout)

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Faz login e retorna token.

        Args:
            email: Email do usuário
            password: Senha

        Returns:
            Dict com token e dados do usuário
        """
        response = self.post(
            "/api/users/login",
            json_data={"email": email, "password": password}
        )
        return as_api_data(response.data)

    def create_lead_public(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria lead via endpoint público (se existir).

        Args:
            data: Dados do lead

        Returns:
            Dict com lead criado
        """
        # Supondo que existe endpoint público para criar lead
        response = self.post("/api/leads/create-public", json_data=data)
        if isinstance(response.data, dict) and isinstance(response.data.get("doc"), dict):
            return as_api_data(response.data["doc"])
        return as_api_data(response.data)


# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def build_where_clause(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Constrói cláusula where para queries Payload.

    Args:
        filters: Dict com filtros {campo: valor}

    Returns:
        Dict com cláusula where formatada

    Example:
        >>> build_where_clause({"status": "published", "price": {"gte": 100000}})
        {
            "and": [
                {"status": {"equals": "published"}},
                {"price": {"greater_than_equal": 100000}}
            ]
        }
    """
    conditions = []

    for field, value in filters.items():
        if isinstance(value, dict):
            # Operadores especiais (gte, lte, like, etc.)
            for op, val in value.items():
                op_map = {
                    "eq": "equals",
                    "ne": "not_equals",
                    "gt": "greater_than",
                    "gte": "greater_than_equal",
                    "lt": "less_than",
                    "lte": "less_than_equal",
                    "like": "like",
                    "in": "in",
                    "nin": "not_in",
                }
                conditions.append({
                    field: {op_map.get(op, op): val}
                })
        else:
            # Igualdade simples
            conditions.append({field: {"equals": value}})

    if len(conditions) == 0:
        return {}
    elif len(conditions) == 1:
        return conditions[0]
    else:
        return {"and": conditions}


def normalize_phone_br(phone: str) -> str:
    """
    Normaliza telefone brasileiro para formato +55XXXXXXXXXXX.

    Args:
        phone: Telefone em diversos formatos

    Returns:
        Telefone normalizado

    Example:
        >>> normalize_phone_br("(61) 99999-9999")
        "+5561999999999"
    """
    import re

    # Remove tudo que não é dígito
    digits = re.sub(r"\D", "", phone)

    # Adiciona código do país se necessário
    if digits.startswith("55"):
        digits = digits[2:]  # Remove 55 duplicado

    # Adiciona 55 se não tem
    if not digits.startswith("55"):
        digits = f"55{digits}"

    # Formata como +55...
    return f"+{digits}"


def assert_response_success(response: APIResponse, expected_status: int = 200):
    """
    Assert que a resposta foi bem-sucedida.

    Args:
        response: Resposta da API
        expected_status: Status code esperado

    Raises:
        AssertionError: Se response não foi sucesso
    """
    assert response.status_code == expected_status, (
        f"Status {response.status_code} != {expected_status}. "
        f"Erros: {response.errors}"
    )
    assert not response.has_error, f"Resposta contém erros: {response.errors}"


def assert_validation_error(response: APIResponse, field: str = None):
    """
    Assert que a resposta contém erro de validação.

    Args:
        response: Resposta da API
        field: Campo que deve ter erro (opcional)

    Raises:
        AssertionError: Se não é erro de validação
    """
    assert response.status_code == 400, (
        f"Status {response.status_code} não é erro de validação"
    )
    assert response.has_error, "Resposta não contém erros"

    if field:
        errors = response.errors
        assert any(field in str(e) for e in errors), (
            f"Erro esperado no campo '{field}', got: {errors}"
        )
