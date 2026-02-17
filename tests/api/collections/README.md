# Testes CRUD - Properties Collection

## Arquivos Criados

- `tests/api/collections/test_properties.py` - Testes completos CRUD para Properties
- `tests/api/collections/__init__.py` - Init do pacote

## Configuração de Usuários de Teste

Os testes requerem usuários autenticados. Para configurar:

### Opção 1: Via Admin UI (Recomendado)

1. Acesse http://localhost:3000/admin
2. Crie o primeiro usuário admin
3. Crie um usuário agent

### Opção 2: Via Payload Seed (canônico)

```bash
PAYLOAD_SECRET="dev-secret" pnpm db:seed
```

## Executar os Testes

```bash
# Todos os testes de Properties
pytest tests/api/collections/test_properties.py -v

# Apenas testes de listagem
pytest tests/api/collections/test_properties.py::TestPropertiesList -v

# Apenas testes de criação
pytest tests/api/collections/test_properties.py::TestPropertiesCreate -v

# Apenas testes de RBAC
pytest tests/api/collections/test_properties.py -m rbac -v

# Com coverage
pytest tests/api/collections/test_properties.py --cov=tests --cov-report=html
```

## Estrutura dos Testes

### TestPropertiesList (5 testes)
- test_list_properties_anonymous
- test_list_properties_authenticated
- test_list_properties_with_pagination
- test_list_properties_with_depth
- test_list_properties_empty_result

### TestPropertiesRead (4 testes)
- test_read_property_by_id_anonymous
- test_read_property_by_id_authenticated
- test_read_property_not_found
- test_read_property_with_depth

### TestPropertiesCreate (8 testes)
- test_create_property_admin
- test_create_property_agent
- test_create_property_anonymous_forbidden
- test_create_property_validation_error_required_fields
- test_create_property_with_complete_data
- test_create_property_auto_generated_fields
- test_create_property_invalid_price
- test_create_property_duplicate_code

### TestPropertiesUpdate (7 testes)
- test_update_property_admin
- test_update_property_agent
- test_update_property_anonymous_forbidden
- test_update_property_readonly_fields
- test_update_property_partial
- test_update_property_not_found
- test_update_property_validation_error

### TestPropertiesDelete (4 testes)
- test_delete_property_admin
- test_delete_property_agent_forbidden
- test_delete_property_anonymous_forbidden
- test_delete_property_not_found

### TestPropertiesFilters (12 testes)
- test_filter_by_status
- test_filter_by_type
- test_filter_by_category
- test_filter_by_price_range
- test_filter_by_price_greater_than
- test_filter_by_neighborhood
- test_filter_multiple_conditions
- test_filter_or_conditions
- test_filter_by_text_search
- test_sort_by_price_asc
- test_sort_by_price_desc
- test_sort_by_created_at

### TestPropertiesResponseStructure (4 testes)
- test_response_structure_list
- test_response_structure_detail
- test_property_has_timestamps
- test_property_address_structure

### TestPropertiesRelationships (3 testes)
- test_property_belongs_to_neighborhood
- test_property_belongs_to_agent
- test_property_has_featured_image

### TestPropertiesHooks (3 testes)
- test_hook_auto_slug_generation
- test_hook_auto_code_generation
- test_hook_neighborhood_name_sync

**Total: 50 testes**

## Status Codes Validados

- 200: OK (list, read)
- 201: Created (create)
- 400: Bad Request (validation errors)
- 401: Unauthorized (sem autenticação)
- 403: Forbidden (sem permissão)
- 404: Not Found (recurso não existe)
- 409: Conflict (dados duplicados)

## Fixtures Utilizadas

- admin_client, agent_client: Clientes autenticados
- anonymous_client: Cliente sem autenticação
- test_neighborhood: Bairro de teste
- test_media: Mídia de teste
- test_property_data: Dados válidos para propriedade
- created_property: Propriedade criada com cleanup automático
- cleanup_test_data: Cleanup de dados criados nos testes

## Dependências

Os testes utilizam:
- `AuthenticatedAPIClient` - Client HTTP com JWT
- `AnonymousAPIClient` - Client HTTP sem auth
- `PropertyFactory` - Factory de dados de teste
- `pytest` - Framework de testes
- `requests` - Client HTTP
