"""
Conftest principal para testes PrimeUrban.

Este arquivo contém fixtures globais e configurações compartilhadas
entre todos os testes de API e E2E.
"""

import os
import sys
import time
import subprocess
import requests
from typing import Generator, Dict, Any
from pathlib import Path

import pytest
from dotenv import load_dotenv

# Adiciona o diretório raiz ao path Python
sys.path.insert(0, str(Path(__file__).parent.parent))


# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

def pytest_configure(config):
    """Configuração inicial do pytest."""
    # Carrega variáveis de ambiente
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)


# =============================================================================
# FIXTURES DE CONFIGURAÇÃO
# =============================================================================

@pytest.fixture(scope="session")
def payload_config() -> Dict[str, Any]:
    """
    Configuração do Payload CMS para testes.

    Returns:
        Dict com configurações: base_url, api_path, credentials, etc.
    """
    return {
        "base_url": os.getenv(
            "PAYLOAD_BASE_URL",
            "http://localhost:3000"
        ),
        "api_path": "/api",
        "admin": {
            "email": os.getenv(
                "PAYLOAD_ADMIN_EMAIL",
                "admin@primeurban.test"
            ),
            "password": os.getenv(
                "PAYLOAD_ADMIN_PASSWORD",
                "test-admin-pass-123"
            ),
        },
        "agent": {
            "email": os.getenv(
                "PAYLOAD_AGENT_EMAIL",
                "agent@primeurban.test"
            ),
            "password": os.getenv(
                "PAYLOAD_AGENT_PASSWORD",
                "test-agent-pass-123"
            ),
        },
        "timeout": int(os.getenv("PAYLOAD_TIMEOUT", "30")),
    }


@pytest.fixture(scope="session", autouse=True)
def ensure_seed(payload_config: Dict[str, Any]) -> None:
    """
    Garante que os usuários de teste existam antes de qualquer login.

    Reaplica o seed oficial que cria admin@primeurban.test e agent@primeurban.test.
    """
    env = os.environ.copy()
    env.setdefault("PAYLOAD_SECRET", os.getenv("PAYLOAD_SECRET", "dev-secret"))
    env.setdefault("DATABASE_URL", os.getenv("DATABASE_URL", "file:./payload.db"))
    try:
        subprocess.run(
            ["pnpm", "db:seed"],
            cwd=Path(__file__).parent.parent,
            check=True,
            env=env,
        )
    except FileNotFoundError as exc:
        pytest.exit(
            f"Não foi possível executar `pnpm db:seed` porque pnpm não foi encontrado: {exc}",
            returncode=1,
        )
    except subprocess.CalledProcessError as exc:
        pytest.exit(
            f"Erro ao executar `pnpm db:seed`: {exc}",
            returncode=1,
        )


@pytest.fixture(scope="session")
def api_base_url(payload_config: Dict[str, Any]) -> str:
    """URL base da API do Payload."""
    return f"{payload_config['base_url']}{payload_config['api_path']}"


# =============================================================================
# FIXTURES DE AUTENTICAÇÃO
# =============================================================================

@pytest.fixture(scope="session")
def admin_token(payload_config: Dict[str, Any]) -> str:
    """
    Obtém token de autenticação para usuário admin.

    Returns:
        JWT token string

    Raises:
        AssertionError: se login falhar
    """
    response = requests.post(
        f"{payload_config['base_url']}/api/users/login",
        json={
            "email": payload_config["admin"]["email"],
            "password": payload_config["admin"]["password"],
        },
        timeout=payload_config["timeout"],
    )

    assert response.status_code == 200, (
        f"Falha ao fazer login como admin: {response.text}"
    )

    data = response.json()
    assert "token" in data, "Resposta de login não contém token"

    return data["token"]


@pytest.fixture(scope="session")
def agent_token(payload_config: Dict[str, Any]) -> str:
    """
    Obtém token de autenticação para usuário agent.

    Returns:
        JWT token string

    Raises:
        AssertionError: se login falhar
    """
    response = requests.post(
        f"{payload_config['base_url']}/api/users/login",
        json={
            "email": payload_config["agent"]["email"],
            "password": payload_config["agent"]["password"],
        },
        timeout=payload_config["timeout"],
    )

    assert response.status_code == 200, (
        f"Falha ao fazer login como agent: {response.text}"
    )

    data = response.json()
    assert "token" in data, "Resposta de login não contém token"

    return data["token"]


@pytest.fixture(scope="session")
def admin_user_data(admin_token: str, payload_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Obtém dados completos do usuário admin.

    Returns:
        Dict com dados do usuário admin
    """
    response = requests.get(
        f"{payload_config['base_url']}/api/users/me",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
        timeout=payload_config["timeout"],
    )

    assert response.status_code in (200, 201)
    payload = response.json()
    if isinstance(payload, dict) and isinstance(payload.get("user"), dict):
        return {**payload["user"], "user": payload["user"]}
    return payload


@pytest.fixture(scope="session")
def agent_user_data(agent_token: str, payload_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Obtém dados completos do usuário agent.

    Returns:
        Dict com dados do usuário agent
    """
    response = requests.get(
        f"{payload_config['base_url']}/api/users/me",
        headers={
            "Authorization": f"Bearer {agent_token}"
        },
        timeout=payload_config["timeout"],
    )

    assert response.status_code == 200
    payload = response.json()
    if isinstance(payload, dict) and isinstance(payload.get("user"), dict):
        return {**payload["user"], "user": payload["user"]}
    return payload


# =============================================================================
# FIXTURES DE CLIENT HTTP
# =============================================================================

@pytest.fixture
def admin_client(
    admin_token: str,
    payload_config: Dict[str, Any]
) -> Generator["AuthenticatedAPIClient", None, None]:
    """
    Client HTTP autenticado como admin.

    Yields:
        AuthenticatedAPIClient instância
    """
    # Import aqui para evitar import circular
    from tests.api.utils import AuthenticatedAPIClient

    client = AuthenticatedAPIClient(
        base_url=payload_config["base_url"],
        token=admin_token,
        timeout=payload_config["timeout"],
    )
    yield client
    # Cleanup automático (session fechado pelo client)


@pytest.fixture
def agent_client(
    agent_token: str,
    payload_config: Dict[str, Any]
) -> Generator["AuthenticatedAPIClient", None, None]:
    """
    Client HTTP autenticado como agent.

    Yields:
        AuthenticatedAPIClient instância
    """
    from tests.api.utils import AuthenticatedAPIClient

    client = AuthenticatedAPIClient(
        base_url=payload_config["base_url"],
        token=agent_token,
        timeout=payload_config["timeout"],
    )
    yield client


@pytest.fixture
def anonymous_client(
    payload_config: Dict[str, Any]
) -> Generator["AnonymousAPIClient", None, None]:
    """
    Client HTTP anônimo (sem autenticação).

    Yields:
        AnonymousAPIClient instância
    """
    from tests.api.utils import AnonymousAPIClient

    client = AnonymousAPIClient(
        base_url=payload_config["base_url"],
        timeout=payload_config["timeout"],
    )
    yield client


# =============================================================================
# FIXTURES DE DADOS DE TESTE
# =============================================================================

@pytest.fixture(scope="session")
def test_neighborhood(
    admin_token: str
) -> Dict[str, Any]:
    """
    Cria ou reutiliza um bairro de teste.

    Returns:
        Dict com dados do bairro
    """
    # Tenta encontrar bairro existente
    response = requests.get(
        "http://localhost:3000/api/neighborhoods",
        params={"limit": 100},
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=30,
    )

    if response.status_code == 200:
        for neighborhood in response.json().get("docs", []):
            if neighborhood.get("name") == "Bairro Teste":
                return neighborhood

    # Cria novo bairro
    response = requests.post(
        "http://localhost:3000/api/neighborhoods",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Bairro Teste",
            "zone": "Norte",
            "description": "Bairro criado automaticamente para testes",
        },
        timeout=30,
    )

    assert response.status_code in (200, 201)
    return response.json()


@pytest.fixture(scope="function")
def cleanup_test_data(
    admin_client: "AuthenticatedAPIClient"
) -> Generator[None, None, None]:
    """
    Fixture para limpar dados criados durante os testes.

    Uso:
        Cada teste que cria dados deve guardar os IDs e
        usar esta fixture para limpar no teardown.
    """
    created_ids = {"properties": [], "leads": [], "users": []}

    yield created_ids

    # Cleanup: deletar todos os dados criados
    for collection, ids in created_ids.items():
        for id_ in ids:
            try:
                admin_client.delete(collection, id_)
            except Exception:
                pass  # Ignora erros no cleanup


# =============================================================================
# FIXTURES DE ESPERA/RETRY
# =============================================================================

@pytest.fixture
def wait_for_condition():
    """
    Helper para esperar até que uma condição seja verdadeira.

    Example:
        def test_something(wait_for_condition):
            wait_for_condition(
                lambda: some_check(),
                timeout=5,
                interval=0.5
            )
    """
    def _wait(condition, timeout=10, interval=0.5):
        """Espera até que condition() retorne True."""
        start = time.time()
        while time.time() - start < timeout:
            if condition():
                return True
            time.sleep(interval)
        raise TimeoutError(
            f"Condição não atingida após {timeout}s"
        )

    return _wait


# =============================================================================
# SKIP CONDICIONAL
# =============================================================================

def pytest_collection_modifyitems(config, items):
    """
    Modifica a coleção de testes antes da execução.

    - Pula testes E2E se PLAYWRIGHT_SKIP env var estiver setada
    - Adiciona marca 'slow' a testes que levam > 1s
    """
    skip_e2e = os.getenv("PLAYWRIGHT_SKIP", "").lower() == "true"

    for item in items:
        # Pula testes E2E se configurado
        if skip_e2e and "e2e" in item.keywords:
            item.add_marker(
                pytest.mark.skip(reason="Testes E2E desabilitados via PLAYWRIGHT_SKIP")
            )
