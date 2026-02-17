Starting CodeRabbit review in plain text mode...

Connecting to review service
Setting up
Analyzing
Reviewing

============================================================================
File: tests/api/helpers/__init__.py
Line: 16 to 17
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/__init__.py around lines 16 - 17, The imported functions buildWhereClause and normalizePhoneBr use camelCase; rename them in the source module .payload_client to snake_case (build_where_clause and normalize_phone_br), update all callers/tests to the new names, and adjust this file's imports to import build_where_clause and normalize_phone_br from .payload_client; if you need to preserve backwards compatibility temporarily, add snake_case wrappers in .payload_client that call the new functions and mark the camelCase names as deprecated.



============================================================================
File: package.json
Line: 12 to 16
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @package.json around lines 12 - 16, The package.json scripts currently call Python's pytest (scripts "test:e2e", "test:api", "test:all", "test:coverage", "test:watch"), which is incorrect for a Node.js/Next.js repo; replace these pytest entries with the appropriate JavaScript test runner commands you intend to use (e.g., Jest, Vitest or Playwright) — update each script name ("test:e2e", "test:api", "test:all", "test:coverage", "test:watch") to invoke the chosen JS tool’s CLI (or remove them) and add the corresponding devDependency and README note; if Python tests are intentionally present, instead keep the pytest scripts but add documentation in the README explaining that Python tests exist and ensure the CI/dev environment installs and activates the Python environment before running those npm scripts.



============================================================================
File: payload/components/logo.tsx
Line: 1 to 38
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/components/logo.tsx around lines 1 - 38, Extract the hardcoded color values used in the Logo component into design token constants (e.g., create LOGO_COLORS with PRIMARY_TEXT '#F9F6F0' and ACCENT '#B68863') and replace the inline hex strings in the Logo function with those constants; optionally remove the redundant aria-label on the div (aria-label="PrimeUrban") since the visible text already provides accessible name, but keep it if you prefer explicit labeling.



============================================================================
File: payload/payload.config.ts
Line: 59 to 66
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/payload.config.ts around lines 59 - 66, The autoLogin block contains hardcoded dev credentials; replace them with environment-driven values and tighten the dev-bypass check: update isDevBypassActive() to explicitly verify NODE_ENV !== 'production' (and any other gating flag) and, in the autoLogin config, read email, password and prefillOnly from environment variables (e.g., DEV_AUTOLOGIN_EMAIL, DEV_AUTOLOGIN_PASSWORD, DEV_AUTOLOGIN_PREFILL) and fall back to false/undefined when not set so no secrets live in source or git history; ensure the auto-login branch only activates when isDevBypassActive() returns true and validate presence of dev creds before enabling auto-login.



============================================================================
File: tests/api/test_config.py
Line: 19 to 22
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_config.py around lines 19 - 22, The test test_python_version in tests/api/test_config.py incorrectly asserts sys.version_info >= (3,14) (nonexistent); update the assertion to a realistic minimum (e.g., sys.version_info >= (3,10) or the project's supported minimum such as (3,12)) or compare major/minor explicitly (sys.version_info[:2] >= (3,10)) so the test passes on current Python releases; modify the tuple in the test_python_version function accordingly.



============================================================================
File: payload/access/dev-bypass.ts
Line: 3 to 8
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/access/dev-bypass.ts around lines 3 - 8, Os comentários do bloco JSDoc e os comentários inline no export devBypassAccess estão em línguas diferentes; padronize-os para um idioma único (por exemplo, todo em inglês ou todo em português) para consistência: atualize o JSDoc acima de devBypassAccess e qualquer comentário inline dentro da função para o mesmo idioma escolhido, mantendo o mesmo sentido explicativo ("Access control bypass for development..." → traduzir para português ou o comentário inline "Só permite..." → traduzir para inglês) e preserve o tom de aviso sobre uso apenas em NODE_ENV=development.



============================================================================
File: tests/api/test_config.py
Line: 55 to 57
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_config.py around lines 55 - 57, The test function test_smoke_test currently does only assert True, which always passes; update the test to make intent explicit by adding a clear docstring or inline comment in test_smoke_test stating that this is an intentional minimal smoke test to verify the test runner boots (or replace it with a simple meaningful assertion that still serves as a smoke check), and optionally add a pytest marker like @pytest.mark.smoke to clarify its purpose.



============================================================================
File: tests/api/test_config.py
Line: 14 to 17
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_config.py around lines 14 - 17, The test_pytest_installed function contains a redundant inner import of pytest (pytest is already imported at the module level); remove the local "import pytest" line from the test_pytest_installed function so it uses the module-level pytest and keep the existing assertion (assert pytest.__version__ is not None).



============================================================================
File: test-primeurban.py
Line: 14
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py at line 14, Replace the hardcoded base URL strings used in page.goto calls in test-primeurban.py with a configurable constant or environment variable (e.g., BASE_URL); add code that reads BASE_URL from the environment (with a sensible default like 'http://localhost:3000') at module scope, then update every page.goto(...) invocation in the file (the calls that currently pass 'http://localhost:3000' and its path variants) to use BASE_URL or f'{BASE_URL}/path' instead so tests can run against staging/CI without editing the test file.



============================================================================
File: test-primeurban.py
Line: 49
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py at line 49, Replace the brittle fixed sleeps (calls to page.wait_for_timeout) with explicit waits for meaningful UI conditions: locate the occurrences of page.wait_for_timeout and change them to page.wait_for_selector or locator.wait_for (or expect(locator).to_be_visible()) targeting the specific element that must be present/visible (e.g., '.property-card' or the actual selector used nearby) so the test waits on a deterministic condition; update every occurrence (including the ones referenced at the other lines) to use the appropriate selector/locator for the step instead of a fixed timeout.



============================================================================
File: middleware.ts
Line: 84 to 85
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @middleware.ts around lines 84 - 85, The module currently creates RATE_LIMITER at import time even when RATE_LIMIT_ENABLED is false, causing the cleanup interval to run in dev; change to lazy instantiation by replacing the eager RATE_LIMITER constant with a nullable variable (e.g., RATE_LIMITER = null) and only instantiate new RateLimiter(...) when you first need it (inside the middleware handler or a getRateLimiter helper), guarded by RATE_LIMIT_ENABLED; ensure any cleanup interval or background timers are only started by the RateLimiter constructor when it is actually created so no timers run when RATE_LIMIT_ENABLED is false.



============================================================================
File: payload/collections/Properties.ts
Line: 76
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/collections/Properties.ts at line 76, The beforeChange hook order causes autoSlug and autoCode to run on updates only to be overwritten by preserveGeneratedIdentity; fix by either moving preserveGeneratedIdentity to the start of the beforeChange array so it runs before syncNeighborhoodName/autoSlug/autoCode (thereby preventing generation on updates), or better, modify autoSlug and autoCode themselves to check for an existing/generated identity and skip generation when a value exists (i.e., add a guard in autoSlug and autoCode to return early if the field is already present), referencing the beforeChange array and the hooks autoSlug, autoCode, preserveGeneratedIdentity, and syncNeighborhoodName to locate the code.



============================================================================
File: payload/hooks/validators.ts
Line: 14 to 25
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/hooks/validators.ts around lines 14 - 25, The current check that strips a leading national "0" only when digits.length === 12 misses cases like "5506199999999" because after removing "55" the string is 11 chars but still starts with "0"; update the condition around the variable digits (after stripNonDigits(phone)) to remove a leading "0" when it startsWith('0') and the length is 11 or 12 (e.g., change digits.length === 12 to digits.length === 11 || digits.length === 12, or use digits.length >= 11 && digits.length <= 12) so numbers like "06199999999" become "61999999999". Ensure this logic sits in the same block that currently slices the leading "0".



============================================================================
File: tests/e2e/conftest.py
Line: 19 to 29
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/conftest.py around lines 19 - 29, The docstring for the fixture base_url is inconsistent with the actual default URL; update the docstring in the base_url function to reflect the true default ("http://localhost:3000") so documentation matches code (or alternatively change the return default to "http://localhost:3002" if the intended default is 3002) — locate the base_url fixture and either correct the descriptive text to say port 3000 or change the os.getenv fallback to "http://localhost:3002" to match the existing docstring, and ensure the docstring and the os.getenv default are consistent.



============================================================================
File: tests/e2e/conftest.py
Line: 72 to 90
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/conftest.py around lines 72 - 90, O fixture context está hardcoding locale="pt-BR"; torne-o configurável lendo uma variável de ambiente (ex.: TEST_LOCALE) ou opção do pytest e usando seu valor como locale ao chamar browser.new_context; atualize a assinatura/imports para usar os.environ (ou request.config.getoption) e mantenha "pt-BR" como valor padrão se a variável não existir, referenciando o fixture context e a chamada browser.new_context/BrowserContext para localizar onde aplicar a mudança.



============================================================================
File: pytest.ini
Line: 5
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @pytest.ini at line 5, Atualize a organização dos testes: mova o arquivo test-primeurban.py para dentro do diretório tests/ e renomeie-o para um nome padrão como test_primeurban.py; em seguida ajuste a configuração em pytest.ini removendo o arquivo individual e deixando apenas testpaths = tests para apontar ao diretório. Localize a entrada testpaths no pytest.ini e o arquivo test-primeurban.py no repositório para aplicar a mudança; garanta que quaisquer imports ou referências ao nome antigo sejam atualizados para test_primeurban.py.



============================================================================
File: test-primeurban.py
Line: 57 to 77
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py around lines 57 - 77, The test_property_filters function currently returns True in all branches so it never fails; replace the boolean returns with real assertions: assert transaction_type_filter.is_visible() when the 'transaction_type_filter' locator is found, otherwise assert selects > 0 when counting 'select' elements (variable selects), and finally assert False with a descriptive message if neither condition is met so the test fails when no filters exist. Use the existing locators/variables (transaction_type_filter, selects) and remove the unconditional return True paths so test failures reflect missing UI elements.



============================================================================
File: payload/collections/Properties.ts
Line: 45 to 55
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @payload/collections/Properties.ts around lines 45 - 55, The preserveGeneratedIdentity hook assigns originalDoc.code and originalDoc.slug to data without checking they exist; add a defensive check inside preserveGeneratedIdentity so you only overwrite data.code and data.slug when originalDoc && originalDoc.code !== undefined and originalDoc.slug !== undefined (or handle each field individually), otherwise leave the existing data values intact and return data as before. Ensure you reference preserveGeneratedIdentity, data.code, data.slug, originalDoc.code and originalDoc.slug when making the conditional checks.



============================================================================
File: tests/e2e/conftest.py
Line: 121 to 123
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/conftest.py around lines 121 - 123, A sanitização atual só substitui "/" e "\" em request.node.name antes de criar screenshot_path, mas no Windows nomes de arquivo também não podem conter :  ? "  |; atualize a lógica que cria test_name (usando request.node.name) para substituir todos os caracteres proibidos (por exemplo, um regex que remova/replace [:"/\\|?] e caracteres de controle), opcionalmente truncar o resultado para um safe length, e então usar esse valor ao montar screenshot_path e ao salvar no screenshot_dir para evitar erros em Windows e outros sistemas de arquivos.



============================================================================
File: scripts/seed.ts
Line: 1 to 4
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @scripts/seed.ts around lines 1 - 4, Reordene os imports para colocar bibliotecas externas primeiro e utilitários locais depois: mova "import { getPayload } from 'payload'" acima dos imports locais e depois importe "config" (../payload/payload.config) e "seed" (../seed); ajuste também a separação entre grupos de imports se necessário para manter clareza.



============================================================================
File: test-primeurban.py
Line: 145 to 150
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py around lines 145 - 150, O bloco except captura qualquer exceção e só adiciona ("Error", False) a results; modifique-o para registrar qual teste falhou: ao capturar except Exception as e, inclua o identificador do teste atual (p.ex. uma variável current_test, test_name ou similar) junto com o erro e o stacktrace ao adicionar a entrada em results e no log; use page.screenshot(path=...) como já está, e se não houver um identificador disponível, insira um valor padrão como "UnknownTest" e armazene algo como (test_identifier, False, str(e)) para não misturar resultados de testes bem-sucedidos com um erro genérico.



============================================================================
File: test-primeurban.py
Line: 79 to 98
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py around lines 79 - 98, The test_payload_admin_login function only takes a screenshot and returns True without any assertions; replace the dummy return with real validations: wait_for_selector or use page.locator(...).count()/expect to assert that either the login form (input[type="email"] and password) or the admin panel indicator (text "Payload" or a known admin element) is present, and fail the test if neither is found (raise/assert accordingly); also remove the unconditional return True and ensure the function uses Playwright's waiting/assertion APIs (e.g., page.wait_for_selector or expect) so the test actually verifies the admin page is reachable.



============================================================================
File: tests/api/README_RBAC_HOOKS.md
Line: 145 to 146
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/README_RBAC_HOOKS.md around lines 145 - 146, Fix the list item formatting by adding a space after the leading hyphen in the line "-pytest configurado com fixtures do conftest.py" so it reads "- pytest configurado com fixtures do conftest.py"; update the README_RBAC_HOOKS.md entry containing that exact text fragment to ensure consistent Markdown list formatting.



============================================================================
File: seed.ts
Line: 10 to 11
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @seed.ts around lines 10 - 11, Remove plaintext test passwords from the console output in seed.ts by deleting or changing the two console.log lines that currently print 'admin@primeurban.test / test-admin-pass-123 (admin)' and 'agent@primeurban.test / test-agent-pass-123 (agent)'; instead print only the usernames/roles or a note that credentials are available via secure channels, or reference environment variables (e.g., process.env.TEST_ADMIN_EMAIL) if you must emit credential info without hardcoding secrets. Ensure no literal passwords remain in seed.ts or logs.



============================================================================
File: pytest.ini
Line: 27
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @pytest.ini at line 27, A opção de cobertura atual "--cov=tests" está apontando para o diretório de testes em vez do código de produção; abra pytest.ini, localize a entrada "--cov=tests" e substitua-a pelo diretório ou nome do pacote do código-fonte (por exemplo "--cov=src" ou "--cov=primeurban" ou pelo nome do pacote principal usado no projeto) para garantir que a medição de cobertura aponte para o código de produção; se o projeto usa múltiplos pacotes, adicione entradas --cov separadas para cada pacote relevante.



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 170 to 172
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py around lines 170 - 172, Replace the broad pytest.raises(Exception) in the deletion assertion with the specific NotFound error type used by the project (e.g., NotFoundError from utils) so only the expected "not found" case passes; update the test to import the specific exception (e.g., from utils import NotFoundError) and use pytest.raises(NotFoundError) around the admin_client.find_by_id("properties", created["id"]) call to avoid masking other failures.



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 798 to 800
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py around lines 798 - 800, Typo in the section comment "TESTES DE HOOKS - USER PHONE/CODECI NORMALIZATION": replace "CODECI" with the correct "CRECI" (Conselho Regional de Corretores de Imóveis) wherever that header or the term "CODECI" appears in the test file (e.g., the comment string "TESTES DE HOOKS - USER PHONE/CODECI NORMALIZATION") so the section reads "TESTES DE HOOKS - USER PHONE/CRECI NORMALIZATION".



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 576 to 587
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py around lines 576 - 587, The test test_normalize_phone_formats_brazilian_numbers expects the wrong normalized phone string (ten digits) for the input "(61) 99999-9999"; confirm whether the normalizeLeadPhone hook implementation correctly preserves all digits and if so update the assertion to expect "61999999999" (11 digits), otherwise fix normalizeLeadPhone to not drop a digit when normalizing Brazilian mobile numbers; reference the test function test_normalize_phone_formats_brazilian_numbers and the normalizeLeadPhone hook when making the change.



============================================================================
File: tests/api/fixtures.py
Line: 32 to 35
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/fixtures.py around lines 32 - 35, Replace the deprecated datetime.utcnow() in the classmethod _generate_timestamp with a timezone-aware call: use datetime.now(timezone.utc) instead and ensure timezone is imported (from datetime import datetime, timezone) or referenced as datetime.timezone; keep the .isoformat() call so the method remains returning an ISO timestamp but now with UTC tzinfo.



============================================================================
File: test-primeurban.py
Line: 7 to 9
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py around lines 7 - 9, Move the inline import of traceback out of the except block and add a top-level import; specifically, add "import traceback" alongside the existing top imports (the block with "from playwright.sync_api import sync_playwright, Page, Browser", "import time", "import sys") and remove the later "import traceback" inside the except at line 147 so the module import is centralized.



============================================================================
File: tests/api/collections/README.md
Line: 40
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/README.md at line 40, The README's pytest command uses --cov=tests which measures test files instead of application code; update the command string "pytest tests/api/collections/test_properties.py --cov=tests --cov-report=html" to point --cov at your source package (e.g., --cov=src or --cov=app or the project module name) so coverage reports the application code rather than the tests, and adjust the example to match the actual source directory/module.



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 589 to 599
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py around lines 589 - 599, The assertion in test_normalize_phone_handles_plus55 is expecting one digit less than the normalization logic produces; update the expected value to "61999999999" so the test asserts response["phone"] == "61999999999" after calling admin_client.create("leads", lead_data) in the test_normalize_phone_handles_plus55 test.



============================================================================
File: test-primeurban.py
Line: 133 to 144
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @test-primeurban.py around lines 133 - 144, Os testes estão reusando a mesma instância de page (variável page criada a partir de browser.new_page()), causando poluição de estado entre testes; altere a execução para abrir um novo contexto/page por caso de teste (por exemplo criar browser.new_context() e context.new_page() ou chamar browser.new_page() antes de cada chamada) em vez de reusar page quando invocar test_homepage, test_navigation, test_properties_listing, test_property_filters e test_payload_admin_login; alternativamente, migre para pytest com fixtures do pytest-playwright que provisionam um novo contexto/page isolado para cada teste e ajuste a seção que popula results para criar/fechar a página/contexto em torno de cada chamada.



============================================================================
File: tests/api/fixtures.py
Line: 14 to 15
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/fixtures.py around lines 14 - 15, Remove the unused imports Optional and timedelta from the import statement that currently reads "from typing import Dict, Any, Optional, List" and "from datetime import datetime, timedelta" in this module; update those lines to only import the types and names actually used (e.g., keep Dict, Any, List and datetime if used) so there are no unused imports (remove references to Optional and timedelta).



============================================================================
File: tests/e2e/test_property_detail.py
Line: 34 to 81
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 34 - 81, The KNOWN_PROPERTIES dict in test_property_detail.py duplicates mock data and can drift from the real fixtures; replace this hardcoded KNOWN_PROPERTIES by importing or loading the canonical mock source used by the application (e.g., the module/fixture that defines property mocks) and reference that shared object in the tests instead of redefining it so tests always use a single source of truth; update any test references to KNOWN_PROPERTIES to use the imported mock source (or a filtered view of it) and remove the hardcoded dict to avoid duplication and stale data.



============================================================================
File: .github/workflows/test.yml
Line: 90 to 141
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @.github/workflows/test.yml around lines 90 - 141, The test-api and test-e2e jobs duplicate ~60% of their setup steps; extract the repeated steps into a reusable unit (either a composite action or a reusable workflow) and call it from both jobs to follow DRY. Create a composite action (e.g., .github/actions/setup-test-env) that encapsulates the shared steps (checkout, Node setup, pnpm setup, Python setup/venv, caching, dependency installs, Playwright browser install, build/seed as applicable) and then replace the duplicated blocks in the test-api and test-e2e jobs with a single uses: reference to that composite action; keep only job-specific steps (like different seeds or any extra installs) in each job.



============================================================================
File: tests/e2e/test_filters.py
Line: 344 to 373
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 344 - 373, The test test_filter_by_transaction_type_venda currently only asserts filtered_count > 0; update it to actually verify each result's transaction type by calling a new Page Object method (e.g., page.get_transaction_types()) after page.filter_by_transaction_type("venda") and asserting each returned value equals "venda" (case-insensitive); implement get_transaction_types() in the PropertiesPage object to return the list of displayed transaction type strings so the looped assertions can validate every shown property.



============================================================================
File: tests/e2e/test_filters.py
Line: 54 to 167
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 54 - 167, These three near-duplicate tests (test_filter_by_apartamento_shows_only_apartments, test_filter_by_casa_shows_only_houses, test_filter_by_cobertura_shows_only_penthouses) should be collapsed into a single parametrized test; replace them with one pytest.mark.parametrize test (e.g., test_filter_by_property_type_shows_only_matching) that iterates over tuples of (property_type, display_name) and reuses navigate_to_properties, page.filter_by_property_type, page.wait_for_timeout, page.get_property_count and page.get_property_types to assert filtered_count > 0 and that every prop_type == property_type, using display_name only in assertion messages.



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 828 to 829
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py around lines 828 - 829, The test currently allows two different formats for creci (response["creci"] == "DF-12345" or "DF12345"), which masks inconsistent behavior; pick a single canonical format (e.g., "DF12345" if the rule is "uppercase and no spaces" or "DF-12345" if the hyphen is required) and change the assertion to assert response["creci"] == "" only, and if necessary update the hook/normalization code the test targets so that the function that produces creci always returns that canonical format (locate usages of response["creci"] in the test and the hook function that formats CRECI to keep them aligned).



============================================================================
File: tests/e2e/test_filters.py
Line: 78 to 79
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 78 - 79, Replace the fixed sleep call page.wait_for_timeout(1000) with an explicit condition-based wait: remove page.wait_for_timeout and instead wait for a meaningful UI or network condition (e.g. use page.wait_for_selector("[data-testid='property-card']") to wait for result cards, page.wait_for_load_state("networkidle") for network quiescence, or a wait_for_function/assert that the result count changed) so tests are deterministic and not flaky (look for usages of page.wait_for_timeout in test_filters.py and update them to one of the explicit waits above).



============================================================================
File: tests/api/fixtures.py
Line: 399 to 406
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/fixtures.py around lines 399 - 406, A MediaFactory.image_url está retornando sempre a mesma URL hardcoded; altere image_url para gerar URLs variadas (por exemplo mudando o identificador da imagem ou parâmetros de query) usando um gerador aleatório/determinístico (ex.: uuid4(), random int ou faker) para produzir diferentes photo IDs/params a cada chamada; atualize o método image_url na classe MediaFactory e importe a utilidade necessária (uuid ou random/faker) para garantir variação nas imagens durante os testes (se precisar de repetibilidade, aceite um seed opcional ou use uma função de geração determinística).



============================================================================
File: tests/api/fixtures.py
Line: 304 to 309
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/fixtures.py around lines 304 - 309, No método de classe _random_phone a seleção do DDD usa random.randint(0, 7) sobre a lista ddd, o que é frágil se a lista mudar; substitua essa indexação por random.choice(ddd) para escolher diretamente o valor, mantendo o restante da lógica de geração do número intacta (função _random_phone, variável ddd).



============================================================================
File: tests/e2e/conftest.py
Line: 49 to 58
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/conftest.py around lines 49 - 58, Remova o bloco de "cleanup pré-teste" logo após a chamada page = browser.new_page(): o try/except que pressiona "Escape", espera e faz document.body.click() não tem efeito numa nova página vazia; delete as linhas que executam page.keyboard.press("Escape"), page.wait_for_timeout(...), page.evaluate("() => { document.body.click() }") e o try/except em torno delas, deixando apenas a criação da página (browser.new_page()) e confiando no cleanup pós-teste já existente.



============================================================================
File: tests/conftest.py
Line: 77 to 103
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/conftest.py around lines 77 - 103, O parâmetro payload_config em ensure_seed não é usado; remova-o da assinatura da fixture (ou, se a intenção for forçar ordem de execução, adicione um comentário explicando esse dependency) para evitar parâmetros mortos; além disso, ao chamar subprocess.run dentro de ensure_seed, capture stdout/stderr (passando stdout=subprocess.PIPE, stderr=subprocess.STDOUT e text=True) e, em caso de subprocess.CalledProcessError, inclua exc.output na mensagem de pytest.exit para que o log do seed seja visível; mantenha o tratamento de FileNotFoundError como está.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 89 to 99
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 89 - 99, The fallback that scans the entire HTML via page.content() and regex (all_prices / re.findall) is too broad and may match unrelated numbers; instead limit fallback scope to a specific container or selector near the main price (e.g., search within the main price container or header element) and if you still can't reliably extract a price, log a clear warning via the test logger and return an explicit sentinel (None or a dedicated INVALID_PRICE constant) rather than silently trying to coerce the first match to float; update the function that contains the current all_prices/page.content() logic to use the narrowed selector-first approach and add the warning + sentinel return path.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 112 to 116
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 112 - 116, The current loop using paragraphs[1:5] and hardcoded Brasília patterns is brittle; update the logic in property_detail_page.py that builds/iterates the paragraphs collection so it searches all paragraph elements (not a fixed slice) and uses a more specific selector when available (prefer data-testid or a dedicated class/attribute) to locate the address node; also replace the tight set of city-specific substrings with a configurable/extendable pattern list or a regex that matches common address tokens, and document the limitation in the test helper so callers know it targets Brasília-style addresses.



============================================================================
File: tests/e2e/test_filters.py
Line: 11
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py at line 11, Remova a importação não utilizada "Browser" da declaração de imports (atualmente "from playwright.sync_api import Page, Browser") no arquivo de testes; deixe apenas "Page" importado para eliminar o import morto e evitar avisos/erros de linting.



============================================================================
File: tests/api/fixtures.py
Line: 29 to 30
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/fixtures.py around lines 29 - 30, The local import of uuid inside the function that returns str(uuid.uuid4()) should be moved to the module top-level to avoid per-call overhead; add "import uuid" near the top of the file (after existing imports) and remove the in-function "import uuid" line, leaving the function to simply return str(uuid.uuid4()) wherever that function is defined.



============================================================================
File: tests/conftest.py
Line: 293 to 329
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/conftest.py around lines 293 - 329, The test_neighborhood fixture uses hardcoded "http://localhost:3000" for the GET and POST requests; update both requests to build their URLs from the shared test config (use payload_config['base_url'] as the base) so the fixture is portable when PAYLOAD_BASE_URL changes. In the fixture test_neighborhood (which already receives admin_token), replace the hardcoded URLs for the GET to "/api/neighborhoods" and the POST to "/api/neighborhoods" by concatenating payload_config['base_url'] with those paths, keeping headers, params and timeout unchanged.



============================================================================
File: .github/workflows/test.yml
Line: 27 to 30
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @.github/workflows/test.yml around lines 27 - 30, The workflow currently sets pnpm via the "Setup pnpm" step using pnpm/action-setup with version: latest; change this to pin a specific pnpm release (or a pinned major.minor.patch or workflow variable) so CI is reproducible. Update the "Setup pnpm" step (the uses: pnpm/action-setup@v4 block) to replace version: latest with a specific semver (e.g., a stable patch like 7.31.0) or a matrix/workflow input (e.g., ${{ matrix.pnpm_version }}) and ensure any documentation or matrix entries are added/updated accordingly.



============================================================================
File: tests/api/test_rbac_and_hooks.py
Line: 14
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/test_rbac_and_hooks.py at line 14, The file contains an unused import "json" (import json) in tests/api/test_rbac_and_hooks.py; remove that import line to clean up unused dependencies and satisfy linting—locate the top of the file where the import json statement appears and delete it so no unused import remains.



============================================================================
File: CLAUDE.md
Line: 171
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @CLAUDE.md at line 171, The README is missing documentation for the environment variable NEXT_PUBLIC_PAYLOAD_URL used in the fetch call (const response = await fetch(${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/properties?depth=1)); add a new “Environment variables” section to CLAUDE.md listing NEXT_PUBLIC_PAYLOAD_URL, its purpose (base URL for the Payload CMS API), example values, whether it’s required, that it must be exposed to the browser (NEXT_PUBLIC prefix), and where to set it (local .env, Vercel/hosting). Update the configuration section to reference this variable and include a small usage example showing how the fetch line uses NEXT_PUBLIC_PAYLOAD_URL.



============================================================================
File: DEV_BYPASS_SECURITY_REPORT.md
Line: 30 to 34
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @DEV_BYPASS_SECURITY_REPORT.md around lines 30 - 34, The doc exposes hardcoded credentials (dev@primeurban.com / dev-password-123) and gives unclear/unsafe info about Payload's autoLogin; remove these literal credentials and replace them with placeholders (e.g., , ), add a concise explanation of how the autoLogin feature works referencing "autoLogin" and "Payload" (clarify whether it authenticates against the database or bypasses validation), and add a note that implementers must verify the actual auth flow in the codebase (search for any autoLogin handlers or middleware named "autoLogin" or any Payload config entries) to ensure credentials are validated or limit the feature to dev-only environments.



============================================================================
File: DEV_BYPASS_SECURITY_REPORT.md
Line: 64 to 65
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @DEV_BYPASS_SECURITY_REPORT.md around lines 64 - 65, Update the Conclusion wording to remove absolute claims: replace "secure and production-ready" and "impossible in production" with cautious language (e.g., "designed for production use, pending code review and testing") and remove the claim of "defense-in-depth" unless multiple independent controls exist; reference the actual implementation check (NODE_ENV) by name and state its presence and limitations instead of asserting impossibility. Add a short checklist sentence referencing required next steps: submit the authentication bypass implementation for code review, include automated tests that exercise production-like NODE_ENV and runtime-override scenarios, and document additional independent mitigations (e.g., feature flags, runtime guards, and audit logging) before declaring production readiness. Ensure the doc cites the exact implementation symbol (NODE_ENV check) and links to the code/tests that validate behavior.



============================================================================
File: DEV_BYPASS_SECURITY_REPORT.md
Line: 60 to 62
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @DEV_BYPASS_SECURITY_REPORT.md around lines 60 - 62, A seção "TypeScript Status" inclui menção a erros em seed.ts e arquivos de teste que o revisor considera irrelevantes para o relatório de segurança; remova essa linha ou substitua-a por uma justificativa clara e verificável: abrir referência a seed.ts e aos "test files", afirmar explicitamente que esses erros não afetam a funcionalidade de bypass (por exemplo, declarar que não estão no caminho crítico, não compõem código de produção do bypass, e são cobertos por CI), e apontar para um issue/PR ou pipeline que documente a dívida técnica; atualize o cabeçalho "TypeScript Status" e a nota para que o leitor de segurança tenha garantia sobre seed.ts e test files em relação ao bypass.



============================================================================
File: tests/e2e/test_property_detail.py
Line: 382 to 395
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 382 - 395, Replace the fixed sleep (property_detail_page.wait_for_timeout(2000)) with an explicit wait that polls for images to finish loading: use property_detail_page.page.wait_for_load_state('networkidle') or wait for an "img" to be attached (property_detail_page.page.locator("img").first().wait_for()) and then poll the locator (property_detail_page.page.locator("img")) for an element whose naturalWidth > 0 (via img.evaluate("el => el.naturalWidth")) until a short timeout, then assert loaded_count > 0; this removes the magic 2000ms and ensures the test waits deterministically for actual image load state.



============================================================================
File: .github/workflows/test.yml
Line: 37 to 43
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @.github/workflows/test.yml around lines 37 - 43, O passo "Cache node modules" que usa actions/cache@v4 só está salvando node_modules (key: ${{ runner.os }}-node-${{ hashFiles('pnpm-lock.yaml') }}) e ignora o pnpm store global (~/.local/share/pnpm/store), reduzindo a eficácia do cache; corrija incluindo o path do pnpm store junto com node_modules or substitua este passo pelo cache integrado do actions/setup-node (uses: actions/setup-node@v4 com cache: 'pnpm') para que o cache do pnpm seja corretamente utilizado.



============================================================================
File: tests/conftest.py
Line: 192 to 215
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/conftest.py around lines 192 - 215, The agent_user_data fixture currently asserts response.status_code == 200 which is inconsistent with admin_user_data that allows (200, 201); update the assertion in agent_user_data to mirror admin_user_data by checking response.status_code in (200, 201) (or otherwise use the same validation helper/pattern used by admin_user_data) so both fixtures accept the same successful status codes.



============================================================================
File: tests/e2e/test_filters.py
Line: 34 to 47
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 34 - 47, The fixture navigate_to_properties currently declares an unused page parameter (Page) which is redundant because PropertiesPage already encapsulates the Playwright page; remove the unused parameter from the fixture signature so it becomes def navigate_to_properties(properties_page: PropertiesPage) -> PropertiesPage, keep the docstring and the call to properties_page.goto_properties(), and ensure any tests or fixtures that request navigate_to_properties are unchanged (they will still receive PropertiesPage via the fixture graph).



============================================================================
File: tests/e2e/test_property_detail.py
Line: 160 to 163
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 160 - 163, The current bidirectional check using "expected in actual OR actual in expected" is too permissive; replace it with a single-direction containment check so the actual page title must include the full expected title. Update the assertion that uses actual_title and expected_title to assert expected_title.strip().lower() in actual_title.strip().lower() (remove the "or actual in expected" branch) and keep a clear failure message like f"Title mismatch: expected '{expected_title}' to be contained in actual '{actual_title}'"; apply this change around the assertion that references actual_title and expected_title in the test.



============================================================================
File: tests/e2e/test_filters.py
Line: 526 to 530
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 526 - 530, A verificação atual mistura case-sensitive e case-insensitive (using "Asa Sul" in card_text or "asa sul" in card_text.lower()); simplify by normalizing card_text and checking a single lowercase match: call page.get_property_card_text(i) into card_text and assert that "asa sul" is in card_text.lower() (or use card_text.casefold() for better unicode handling) so the condition is unambiguous and covers all casing variants; update the assertion message to include card_text as before.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 271 to 279
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 271 - 279, The code silently skips filling required fields when locators "#name" or "#email" are missing; update the logic around name_input and email_input (the self.page.locator("#name") and self.page.locator("#email") usages) to explicitly fail the test instead of doing nothing—e.g., check locator.count() and if zero either raise a clear exception (ValueError/RuntimeError) or call an assertion/log error before attempting .fill(name)/.fill(email) so missing required fields cause a test failure.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 328 to 332
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 328 - 332, The locator usage in property_detail_page.py calls success_elem.is_visible() without verifying the locator exists; update the check to first verify success_elem.count() > 0 and only then call success_elem.is_visible(), then return success_elem.text_content() or "" as before (referencing the locator variable success_elem and the methods count(), is_visible(), and text_content()).



============================================================================
File: tests/e2e/test_filters.py
Line: 404 to 430
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 404 - 430, The test test_filter_by_bedrooms only asserts that results exist after calling page.filter_by_bedrooms("3") and never verifies the bedroom count; update the test to retrieve the displayed properties (e.g., via an existing method like page.get_displayed_properties or add page.get_displayed_property_bedrooms) and assert each listed property reports exactly 3 bedrooms rather than just checking page.get_property_count(); if helper methods are missing, implement a helper on PropertiesPage (e.g., get_displayed_property_bedrooms or get_property_details) that returns bedroom counts for visible cards and use that in the test to loop and assert each value == 3.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 312 to 318
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 312 - 318, The code calls error_elem.is_visible() without first confirming the locator actually matches anything, which can raise in strict Playwright modes; update the check to first confirm existence (e.g., use error_elem.count() > 0 or error_elem.element_handle() is not None) before calling error_elem.is_visible(), and only then call error_elem.text_content() (or return "" otherwise) — reference the locator variable error_elem and methods page.locator(), is_visible(), count(), element_handle(), and text_content() when making the change.



============================================================================
File: tests/e2e/test_property_detail.py
Line: 276 to 279
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 276 - 279, The test conflates "no element found" with a legitimate 0 value; update get_property_parking_spaces to return None when the parking element is missing (instead of 0), then change the assertions in the test to first assert actual_parking is not None (with message like "No parking count element found") and only then assert actual_parking == expected_parking (or compare numeric values), referencing get_property_parking_spaces and the two assertions currently checking actual_parking so the test distinguishes missing data from a real zero count.



============================================================================
File: tests/e2e/test_property_detail.py
Line: 476 to 480
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 476 - 480, The test contains an in-function import of the re module; move the import out of the function and place "import re" with the other top-level imports, then remove the in-function "import re" occurrence (the code using phone_pattern, phone_match and whatsapp_link in the test should remain unchanged) so the test follows PEP8 import conventions.



============================================================================
File: DEV_BYPASS_SECURITY_REPORT.md
Line: 10
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @DEV_BYPASS_SECURITY_REPORT.md at line 10, Update the wording to clarify the behavior: change the confusing line that says "process.env.NODE_ENV === 'production' always returns false" to explicitly state that when process.env.NODE_ENV === 'production', the isDevBypassActive() function returns false (thus disabling the dev bypass). Reference the isDevBypassActive() function and the NODE_ENV environment variable in the revised sentence so it reads clearly that the condition causes the function to return false rather than implying the comparison itself is always false.



============================================================================
File: CLAUDE.md
Line: 13 to 14
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @CLAUDE.md around lines 13 - 14, Add a brief explanatory note after the pnpm payload:generate:importmap line in CLAUDE.md that explains when to run the command (e.g., after adding custom admin components, changing or adding collections, modifying admin configuration, or upgrading Payload), and include a short example/phrase that it regenerates the admin import map to pick up new client-side modules; reference the exact command string "pnpm payload:generate:importmap" so maintainers can find and update the entry easily.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 8 to 9
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 8 - 9, The file imports unused symbols typing.List and playwright.sync_api.Locator; remove these unused imports (delete List from the from typing import List line and Locator from from playwright.sync_api import Locator, Page) or, if they were intended to be used, annotate the corresponding functions/classes with List or Locator types (e.g., use Locator in method signatures or variables and List[...] for collections) so the imports are actually referenced; update the import line to only import Page if neither List nor Locator are needed.



============================================================================
File: tests/conftest.py
Line: 332 to 345
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/conftest.py around lines 332 - 345, The fixture cleanup_test_data currently annotates return type as Generator[None, None, None] but yields created_ids (a dict); change the signature to reflect that it yields a Dict[str, List[Any]] (e.g., Generator[Dict[str, List[Any]], None, None]) and update/import the typing names (Dict, List, Any, Generator) if they are not already imported; ensure references to created_ids remain unchanged.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 34 to 35
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 34 - 35, Replace the fixed sleep call self.wait_for_timeout(1000) with a targeted wait that checks for a specific page-ready signal; for example, use the playright-style wait_for_selector or wait_for_load_state (e.g., self.page.wait_for_selector("") or self.page.wait_for_load_state("networkidle")) inside the PropertyDetailPage methods so the test proceeds as soon as the page is actually ready instead of waiting a hard-coded 1000ms; update any callers relying on wait_for_timeout to use this selector or load-state approach and choose a stable selector that uniquely indicates the property detail content has loaded.



============================================================================
File: tests/e2e/test_filters.py
Line: 375 to 402
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 375 - 402, The test test_filter_by_transaction_type_aluguel applies a filter but has no assertions; update it to verify the filter actually took effect by asserting the UI or results: call page.get_property_count() and if filtered_count > 0 assert that every property's transaction type equals "aluguel" (use page.get_properties() or page.get_property_transaction_type(i) / page.get_property_transaction_types() as available), and also assert the filter control is active (e.g., page.is_transaction_type_selected("aluguel") or similar) so the test fails if the filter didn't apply; keep the logic concise and deterministic.



============================================================================
File: tests/e2e/test_property_detail.py
Line: 528 to 549
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_property_detail.py around lines 528 - 549, The locators name_input, email_input and message_input on property_detail_page.page are too broad (e.g., input[type='text']) and can match unrelated fields; update those locator expressions to use more specific attributes or test IDs (for example input[name='name'] or data-testid='contact-name' and input[name='email'] or data-testid='contact-email' and textarea[name='message'] or data-testid='contact-message'), falling back to get_by_label/get_by_placeholder only if the specific attribute/testid is absent, and keep the existing count() assertions to verify presence.



============================================================================
File: tests/api/collections/test_users.py
Line: 1051 to 1091
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 1051 - 1091, These three duplicate tests (test_filter_by_role_admin, test_filter_by_role_agent, test_filter_by_active_true) repeat behavior already covered by TestUsersList.test_list_users_filter_by_role and TestUsersList.test_list_users_filter_by_active; remove the duplicates or consolidate by converting them into a single parametrized test using pytest.mark.parametrize that exercises role equals ("admin","agent") and active equals (True) against the admin_client.find call, or replace their bodies with calls/assertions delegating to the canonical test helpers in TestUsersList (referencing the admin_client.find usage and the response["docs"] assertions) so only one authoritative test remains for each filter case.



============================================================================
File: tests/api/collections/test_users.py
Line: 61 to 64
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 61 - 64, The cleanup currently swallows all errors with "except Exception: pass" around the admin_client.delete("users", user_data["id"]) calls; replace those silent catches with an explicit exception handler that captures the exception (e.g., "except Exception as e") and logs the error (using the test/logger available, e.g., logger.exception or print with context) so failures during cleanup are visible, and apply the same change to the second occurrence that wraps admin_client.delete in the other block.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 54
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py at line 54, Move the inline "import re" out of the methods and into the module-level imports: remove any occurrences of "import re" that were added inside functions in property_detail_page.py and add a single "import re" at the top of the file with the other imports so the regex module is imported once at module load time.



============================================================================
File: tests/e2e/test_filters.py
Line: 432 to 458
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/test_filters.py around lines 432 - 458, The test test_filter_by_parking_spaces currently only checks that some results exist after calling page.filter_by_parking_spaces("2") and must be extended to assert each returned property's parking count is >= 2; after obtaining the result list (use page.get_property_list() or page.get_properties() if available) iterate over each property and call the page-level helper that returns parking info (e.g., page.get_parking_spaces(property) or page.get_property_parking_count(index)) and add an assertion like assert parking_count >= 2 with a helpful message including the property id/index; if those helpers are missing, add a method on the PropertiesPage class (e.g., get_property_parking_count) that reads the parking count from the DOM for a given result and use it in this test.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 252 to 253
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 252 - 253, The current generic check using self.page.locator("form").count() > 0 can return true for any form on the page; update the locator to target the contact form specifically (e.g., use a unique id, data-testid, action or surrounding text) such as replacing self.page.locator("form") with a more precise selector like self.page.locator('form#contact-form') or self.page.locator('form[data-testid="contact-form"]') or self.page.locator('form[action*="contact"]') (or a locator that uses has-text for the contact heading) and keep the existing .count() > 0 check so the test only detects the contact form.



============================================================================
File: tests/api/collections/test_properties.py
Line: 400
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py at line 400, Replace the boolean-or status assertion with a membership check for clarity: change the assertion that inspects exc_info.value.status_code (used in the test function around the failing assertion) so it verifies the status code is in the allowed set (400, 409) instead of using "== 409 or == 400"; update the assertion to use membership (e.g., "in (409, 400)" or "in {400, 409}") to improve readability.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 241 to 243
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 241 - 243, The test helper currently returns a hardcoded WhatsApp fallback URL which can mask real failures; update the method in tests/e2e/pages/property_detail_page.py that builds/returns the ContactForm WhatsApp link (the function that currently returns "https://wa.me/5561999999999") to remove the hardcoded fallback and instead return an empty string (or raise a descriptive exception) when the real link cannot be found so tests fail loudly and expose the underlying issue.



============================================================================
File: tests/e2e/pages/property_detail_page.py
Line: 301 to 302
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/property_detail_page.py around lines 301 - 302, Após chamar submit_btn.click(), remova a espera fixa self.wait_for_timeout(1000) e aguarde deterministicamente por um indicador de conclusão (por exemplo um seletor de sucesso/erro, mudança de rota ou elemento atualizado). Substitua a espera fixa por uma chamada de espera existente na classe (ex.: wait_for_selector, wait_for_text, wait_for_navigation) apontando para o elemento/estado que sinaliza que o submit foi processado, garantindo que submit_btn.click() seja seguido pela verificação do resultado em vez de um timeout arbitrário.



============================================================================
File: tests/api/collections/test_leads.py
Line: 376 to 389
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 376 - 389, The test test_create_lead_auto_assigns_to_agent is missing the teardown call used by other tests; after creating the lead with admin_client.create_lead (and using LeadFactory.with_phone) call the shared cleanup helper cleanup_test_data to remove the created lead (and any related test fixtures), ensuring the cleanup is performed even on assertion failures (e.g., via a finally block or test fixture teardown) so the test does not leave orphaned leads in the system.



============================================================================
File: tests/api/utils.py
Line: 381 to 398
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py around lines 381 - 398, The function find_by_id uses the built-in name id as a parameter; rename that parameter to a non-shadowing name like doc_id (or document_id) in the function signature and update all internal references inside find_by_id (the f-string f"/api/{id}/{...}" and any uses when building params or calling as_api_data) to use doc_id; also update the type hint to match and search/replace any test or call sites that call find_by_id to pass the new parameter name to avoid shadowing the built-in id() function.



============================================================================
File: tests/api/collections/test_users.py
Line: 387
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py at line 387, Replace the verbose double equality check with a membership test: instead of comparing exc_info.value.status_code == 409 or exc_info.value.status_code == 400, assert that exc_info.value.status_code is in a tuple or set of allowed codes (e.g., (400, 409)); update the assertion in tests/api/collections/test_users.py referencing exc_info.value.status_code to use the in check for clarity and brevity.



============================================================================
File: tests/api/collections/test_leads.py
Line: 872 to 927
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 872 - 927, These three tests (test_lead_status_options, test_lead_priority_options, test_lead_source_options) iterate over values and create leads inline which can be left undeleted if an assertion fails; convert each to use pytest.mark.parametrize over the valid values and inside the parametrized test create the lead with LeadFactory.minimal() via admin_client.create_lead, assert the field, and ensure deletion with a try/finally (or a pytest fixture that yields the created lead and always calls admin_client.delete in teardown) referencing the same symbols (LeadFactory.minimal, admin_client.create_lead, admin_client.delete) so cleanup always runs even on assertion failures.



============================================================================
File: tests/api/collections/test_users.py
Line: 772 to 774
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 772 - 774, The second assertion redundantly calls .upper() on response["creci"] after the first assertion already guarantees it's uppercase; change the second check to use response["creci"] directly (e.g., assert "DF" in response["creci"] or "DF-" in response["creci"]) so you remove the unnecessary .upper() call while keeping the same logic for CRECI containing DF or DF-.



============================================================================
File: tests/api/utils.py
Line: 470 to 473
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py around lines 470 - 473, O código atual usa truthiness checks on min_price/max_price which drop zero; change the checks in the function that builds the where filter to use explicit None comparisons (e.g., if min_price is not None / if max_price is not None) so that 0 is accepted and you still append the price range objects to where["and"] (keep the same append logic for {"price": {"greater_than_equal": min_price}} and {"price": {"less_than_equal": max_price}}).



============================================================================
File: tests/api/collections/test_leads.py
Line: 100 to 116
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 100 - 116, The test creates a lead via LeadFactory.minimal() and admin_client.create_lead but never removes it, leaving DB state polluted; modify the test so the created lead is captured (store the returned lead id from admin_client.create_lead) and ensure it is deleted in a teardown/cleanup block (use try/finally or the test framework's fixture teardown) after assertions, referencing the lead id when calling the cleanup delete method so the database is cleaned even if assertions fail.



============================================================================
File: tests/api/collections/test_properties.py
Line: 350 to 351
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py around lines 350 - 351, The test mutates the fixture dict by assigning to test_property_data["code"] and test_property_data["slug"], which can introduce hidden state if fixture scope changes; instead, make a local shallow (or deep if nested) copy of the fixture at the start of the test (e.g., copy of test_property_data) and modify that copy before use, leaving the original test_property_data fixture untouched; update references in this test to use the copied variable so test_property_data remains immutable across tests.



============================================================================
File: tests/api/collections/test_properties.py
Line: 765 to 791
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py around lines 765 - 791, The sorting tests (test_sort_by_price_asc and test_sort_by_price_desc) can pass on empty results; ensure they actually validate sorting by first asserting there are enough items to test (e.g., assert response["docs"] is not empty or assert len(prices) >= 2) before comparing prices to sorted(prices) / sorted(prices, reverse=True); locate the assertions around the response variable returned by admin_client.find and the prices list comprehension to add the non-empty/length precondition check.



============================================================================
File: tests/api/utils.py
Line: 415 to 425
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py around lines 415 - 425, The child class defines delete(self, target: str, id: Optional[str] = None) which conflicts with the parent class's delete(endpoint) signature; rename this method to delete_document (or another non-conflicting name) to preserve LSP and avoid overriding the parent's delete. Update the method name (delete -> delete_document) in the class where it’s defined, keep the original super().delete call inside (using endpoint = target if id is None else f"/api/{target}/{id}"), and then update all call sites/tests that used the old child delete to call delete_document instead; ensure any imports/type hints referencing the old name are updated accordingly.



============================================================================
File: tests/api/collections/test_users.py
Line: 178 to 180
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 178 - 180, The test currently asserts case-sensitive ordering by comparing names = [user.get("name", "") for user in response["docs"]] to sorted(names); instead normalize to a consistent case before comparing to handle case-insensitive server sorting — e.g., build names_lower = [n.lower() for n in response["docs"]] or names_lower = [name.lower() for name in names] and assert names_lower == sorted(names_lower) so the comparison is case-insensitive; update the assertion accordingly.



============================================================================
File: tests/api/collections/test_properties.py
Line: 72 to 78
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py around lines 72 - 78, The test hardcodes the API URL ("http://localhost:3000") when calling requests.post; replace this with a configurable base URL (e.g., use an existing fixture like base_url or api_url, or a central test config) and concatenate the path "/api/media" so tests can run in CI/staging/local; update the upload call in tests/api/collections/test_properties.py (where upload_response is created) to use that fixture/constant instead of the literal string.



============================================================================
File: tests/api/collections/test_leads.py
Line: 439 to 453
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 439 - 453, The test test_update_lead_agent_unassigned_forbidden incorrectly uses admin_user_data["id"] instead of the project standard admin_user_data["user"]["id"] and also never cleans up the created lead; fix by setting lead_data["assignedTo"] = admin_user_data["user"]["id"] when creating the lead via LeadFactory.minimal()/admin_client.create_lead and ensure the created lead is removed after the test (e.g. wrap the agent_client.update assertion in a try/finally and call admin_client.delete("leads", created["id"]) in the finally block) so the test follows existing user-data conventions and leaves no leftover fixtures.



============================================================================
File: .github/workflows/test.yml
Line: 51 to 55
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @.github/workflows/test.yml around lines 51 - 55, The job currently recreates the Python venv and reinstalls deps every run (steps "Create Python venv" and "Install Python dependencies" using uv venv/uv pip), so add a caching step before creating the venv that restores/saves the venv directory and pip cache (e.g., cache keys based on OS and a hash of requirements-dev.txt) using actions/cache; on cache miss create the venv and install, and on cache hit skip reinstall or reuse the restored venv, ensuring the cache step references the same paths used by uv venv and uv pip.



============================================================================
File: tests/api/utils.py
Line: 575 to 589
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py around lines 575 - 589, The create_lead_public method duplicates the unwrap logic found in AuthenticatedAPIClient._unwrap_doc_payload; extract that logic into a module-level utility function (e.g., unwrap_doc_payload) and have both AuthenticatedAPIClient._unwrap_doc_payload and tests.api.utils.create_lead_public call that utility; update create_lead_public to call unwrap_doc_payload(response.data) and return its result so the duplication is removed while preserving existing return behavior.



============================================================================
File: tests/api/collections/test_properties.py
Line: 142 to 161
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py around lines 142 - 161, The tests mix two different response shapes; ensure consistent access by using the same structure returned by admin_client.find across both tests: in test_list_properties_with_pagination (and any other tests), replace direct dict access like page1["docs"], page1["page"], and page1["totalDocs"] with the same .data accessor used in test_list_properties_authenticated (e.g., page1.data["docs"], page1.data["page"], page1.data["totalDocs"]) or alternatively change admin_client.find to always return a plain dict (no .data) and update test_list_properties_authenticated to use response["totalDocs"]/response["docs"]; pick one approach and apply it consistently for admin_client.find, test_list_properties_authenticated, and test_list_properties_with_pagination.



============================================================================
File: tests/api/utils.py
Line: 216 to 232
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py around lines 216 - 232, The special-case 403 handling in _raise_error is confusing because it maps 403 to AuthenticationError when the session lacks an Authorization header; update the _raise_error function to either remove/adjust that special-case or (preferred) add a clear comment immediately above the conditional explaining why 403 is treated as an authentication failure (e.g., "Payload API returns 403 for unauthenticated requests, so map to AuthenticationError when Authorization header is absent"), so future readers understand the intentional deviation from the usual 401/403 semantics.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 33 to 41
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 33 - 41, A seleção por classes Tailwind em get_property_cards() é frágil; atualize o componente de cartão para incluir um atributo estável como data-testid="property-card" e então altere o locator dentro de get_property_cards() para usar esse seletor (por exemplo page.locator('[data-testid="property-card"]')), garantindo que a busca use o novo data-testid em vez de classes CSS voláteis.



============================================================================
File: tests/api/collections/test_users.py
Line: 593 to 598
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 593 - 598, O comentário acima a criação de usuário está incorreto: ele diz "via raw update" mas o código usa UserFactory.minimal(...) seguido de admin_client.create("users", ...); atualize o comentário para refletir a ação real (por exemplo: "Cria agent sem CRECI (via create)") ou, se a intenção for realmente testar um raw update, altere o código para usar a função de update apropriada em vez de admin_client.create; referencie UserFactory.minimal and admin_client.create ao aplicar a correção.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 27 to 31
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 27 - 31, The fixed 1000ms sleep in goto_properties is brittle; replace the wait_for_timeout(1000) call in the goto_properties method with a deterministic wait for a page-ready element (e.g., a property card or a loading-complete marker) by using the test harness' explicit wait utility (e.g., self.page.wait_for_selector or the project's wrapper like self.wait_for_selector) and target a stable selector (for example a property card class or data-testid) so the method waits until the UI is actually rendered before continuing.



============================================================================
File: tests/api/collections/test_leads.py
Line: 221 to 236
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 221 - 236, The test test_read_lead_by_id_agent_unassigned_forbidden uses admin_user_data["id"] but other tests expect user objects like agent_user_data["user"]["id"], so normalize to the fixture shape (e.g., use admin_user_data["user"]["id"] or change fixtures consistently) when setting lead_data["assignedTo"] before calling admin_client.create_lead; also add cleanup to remove the created lead (use the API client to delete the lead via admin_client.delete("leads", created["id"]) or the project’s delete helper) after the assertion to avoid leaving test data behind.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 312 to 322
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 312 - 322, The loop in properties_page.py collects unique slugs using a list membership check (slug not in slugs) which is O(n); replace that with a set to track seen slugs for O(1) membership. Keep the existing slugs list for order if needed: create seen = set(), after extracting slug in the loop check if slug and slug not in seen: then add to both seen.add(slug) and slugs.append(slug). Update references around property_links, slug extraction, and the slugs variable accordingly.



============================================================================
File: tests/api/collections/test_properties.py
Line: 47 to 64
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py around lines 47 - 64, The current try/except blocks around admin_client.find silently swallow all exceptions; instead catch and handle only the expected client/network errors (for example specific exceptions from your client like ApiError, HTTPError, ConnectionError, TimeoutError or the library-specific exception class) when calling admin_client.find (both the filename query and the fallback media_list lookup), log the error details, and re-raise or fail the test for any unexpected exceptions; remove the broad except Exception: pass and replace with targeted except clauses that include logging (or pytest.fail) so real issues aren’t hidden.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 250 to 274
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 250 - 274, The two methods filter_by_bedrooms and filter_by_parking_spaces currently only call wait_for_timeout and must not silently be no-ops; either implement the actual mobile-sheet interaction logic (selecting the bedroom/parking option and applying the filter) inside those functions, or explicitly raise NotImplementedError with a clear message like "filter_by_bedrooms is mobile-only; not implemented for desktop tests" (same for filter_by_parking_spaces) and update their docstrings to state this behavior so tests fail fast and developers know the intent. Ensure you modify the bodies of filter_by_bedrooms and filter_by_parking_spaces (and their docstrings) rather than leaving the wait_for_timeout stub.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 354 to 364
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 354 - 364, The current implementation uses the fragile Tailwind selector ".rounded-full.text-sm" in the type_labels query and hardcodes the property types inside the loop; replace that selector with a stable data attribute (e.g., query by data-testid for the property-type badge) and move the list of property types (["apartamento", "casa", "cobertura", "sala comercial"]) into a shared constant (e.g., PROPERTY_TYPES) so the method that references type_labels and types uses the data-testid locator and iterates over PROPERTY_TYPES instead of an inline list.



============================================================================
File: tests/api/collections/test_users.py
Line: 464 to 467
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_users.py around lines 464 - 467, The test only checks phone length which doesn't ensure proper normalization; replace the loose assertion on response["phone"] with a strict equality check against the expected normalized value for the input update_data["phone"] (e.g., assert response["phone"] == "6199999999"), or compute the expected by stripping non-digits from update_data["phone"] and assert equality; update the assertion near response["phone"], update_data and created_assistant to validate the exact normalized string.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 69 to 72
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 69 - 72, The try/except around self.page.locator("body").click(force=True, timeout=1000) is currently swallowing all exceptions; update the except to catch Exception as e and log the error (e.g., using the test logger or logger.exception) including the exception message/traceback before continuing so failures are visible during test runs while preserving the fallback behavior.



============================================================================
File: tests/api/utils.py
Line: 661
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/utils.py at line 661, The import re statement is currently inside a function; move that import re up to the top of the module alongside the other imports and remove the in-function import re so the module imports are at module scope (follow PEP 8), ensuring any functions that used re continue to reference the module-level import.



============================================================================
File: tests/api/collections/test_leads.py
Line: 937 to 974
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 937 - 974, The three tests test_filter_by_status_new, test_filter_by_status_contacted and test_filter_by_priority_high rely on existing DB state and can pass vacuously when response["docs"] is empty; modify each test to either create a lead with the required status/priority before calling admin_client.find or assert that response["docs"] is non-empty (e.g., assert len(response["docs"]) > 0) prior to the all(...) check to ensure the filter actually returned results; locate the create call or assertion near the top of each test (before the final assert all(... for lead in response["docs"])) so the subsequent checks validate real data.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 206 to 213
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 206 - 213, The hardcoded min/max (0 and 10000000) used when computing min_percent and max_percent will desync from the frontend; instead fetch the real limits and use them: either import/consume the shared PRICE_LIMITS constant used by the app (reference PRICE_LIMITS) or read the slider DOM attributes (e.g., get_attribute on the slider element to obtain data-min/data-max or aria-valuemin/aria-valuemax) before computing min_percent and max_percent in the method that contains those calculations so the percentages are derived from the actual limits.



============================================================================
File: tests/api/collections/test_leads.py
Line: 645 to 663
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_leads.py around lines 645 - 663, The test test_hook_normalize_phone_various_formats currently loops over formats and may skip deleting created leads if an assertion fails; refactor to either convert the loop into a pytest parametrize (use LeadFactory.with_various_phone_formats() values as parameters for test_hook_normalize_phone_various_formats) so each case runs independently, or wrap the create/assert/delete sequence in a try/finally block inside test_hook_normalize_phone_various_formats ensuring admin_client.delete("leads", response["id"]) always runs; reference LeadFactory, admin_client.create_lead and admin_client.delete when making the change.



============================================================================
File: tests/e2e/pages/properties_page.py
Line: 334 to 342
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/e2e/pages/properties_page.py around lines 334 - 342, get_results_heading_text uses a too-generic locator ("h1, h2") which can match unrelated headings; update the locator in get_results_heading_text to target the specific results area (e.g., use a section/class/data-testid tied to the results list) instead of global h1/h2 so heading = self.page.locator(...).first only selects the results count heading; adjust the selector to something like a results container selector (e.g., "section.results h1, section.results h2" or "[data-testid='results-heading']") and keep the rest of the method behavior unchanged.



============================================================================
File: tests/api/collections/test_properties.py
Line: 983
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/collections/test_properties.py at line 983, Ao invés de modificar a fixture original test_property_data inline, crie uma cópia local antes de alterar o campo "code" (por exemplo usando test_data = test_property_data.copy() ou deepcopy se houver nested structures) e então atribua test_data["code"] = "" para gerar o código automaticamente; refira-se ao identificador test_property_data e atualize todas as subsequentes referências no teste para usar a cópia (test_data) para evitar efeitos colaterais na fixture compartilhada.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 192 to 194
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 192 - 194, The subclass PayloadClient is shadowing BasePayloadClient.delete by declaring a different signature (PayloadClient.delete(collection: string, id: string)), violating LSP and duplicating logic in the private deleteRequest; rename the subclass method to a distinct name (e.g., deleteFromCollection or deleteById) and update all callers, remove or consolidate the redundant private deleteRequest into the renamed method or delegate to super.delete(endpoint) for the generic delete(endpoint: string) behavior; also apply the same refactor for the similar methods around the 292-298 range so PayloadClient no longer overrides BasePayloadClient.delete with an incompatible signature.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 309 to 317
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 309 - 317, findProperties currently accepts overly generic string filters; update its parameter types to use explicit union types (e.g., for status, type, category, neighborhood) including an empty string ("") to represent "any", and tighten numeric fields (minPrice/maxPrice) and limit as number | undefined. Locate the findProperties signature and the similar filter definitions referenced later (the block around the other filters) and replace plain string types with the appropriate unions (for example: status: '' | 'active' | 'inactive', type: '' | 'house' | 'apartment', etc.) so callers get type-safe allowed values while keeping "" as a wildcard.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 237 to 243
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 237 - 243, The helper methods (e.g., create in payload-client.ts and other occurrences at the noted locations) currently use the any type; replace these with concrete types from "@/lib/types" or use a generic constrained type parameter instead of any, and add strongly-typed wrappers for each collection (e.g., createProperty(data: PropertyData), createLead(data: LeadData)) that call the generic create method; update signatures for related methods referenced (the other create/update helpers at the noted ranges) to accept the appropriate interfaces (PropertyData, LeadData, UserData, etc.) and remove all uses of any so calls and responses are type-safe.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 123 to 131
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 123 - 131, response.json() can throw on non-JSON or empty bodies; wrap the await response.json() in a try/catch, preserve clearing timeoutId, and if parsing fails fall back to await response.text() (or an empty string) to build a useful error payload before calling this.throwError(response.status, data); update the code around response.json() in the function that returns APIResponse to handle parse errors defensively and ensure successful responses still return data as APIResponse.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 29 to 39
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 29 - 39, Replace the loose any types in the interfaces: change APIResponse to a safer generic (e.g., APIResponse) and swap Record usages in WhereClause to Record or, preferably, concrete filter types from '@/lib/types'; also replace the inline errors type Array with the shared error type (e.g., ApiError or FieldError) imported from '@/lib/types'. Update the interface names APIResponse and WhereClause to use those imports and stronger generics so callers have proper typing instead of any.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 304 to 387
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 304 - 387, The helpers pass paths with a leading slash which duplicates the slash added by the underlying create/find methods, causing double-slash URLs; update createProperty, findProperties, createLead, findLeads, createUser and findUsers to call this.create and this.find with "properties", "leads", and "users" (no leading "/") and leave the existing WhereClause/options logic unchanged so the underlying create/find can prepend its own slash.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 147 to 159
Type: potential_issue

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 147 - 159, The throwError function is passing three args to error classes that expect (message, response), causing the actual API data to be dropped; change throwError to merge the statusCode into the response object (e.g. const response = Object.assign({ status: statusCode }, data)) and then instantiate the error via new ErrorClass(message, response) so ValidationError, AuthenticationError, AuthorizationError, NotFoundError and the default APIError all receive the expected (message, response) signature; update throwError to use this single two-argument constructor pattern.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 467 to 482
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 467 - 482, The normalizePhoneBr function lacks minimum-length validation and the duplicate-country-code threshold is unclear; after stripping non-digits (variable digits) validate that if digits startsWith("55") then digits.length >= 13 (55 + 2 DDD + 9) otherwise digits.length >= 11 (2 DDD + 9), and throw a clear error (or return a consistent failure value) for invalid/empty input; also change the duplicate-country-code check to use cleaned.length >= 13 and add a short comment explaining the 13-digit threshold so future readers understand the magic number — reference normalizePhoneBr, digits and cleaned in your changes.



============================================================================
File: tests/api/helpers/payload-client.ts
Line: 45 to 82
Type: nitpick

Prompt for AI Agent:
Verify each finding against the current code and only fix it if needed.

In @tests/api/helpers/payload-client.ts around lines 45 - 82, As classes de erro usam atualmente response?: any; substitua esse any por um tipo mais específico (por exemplo response?: unknown ou um tipo compartilhado como APIResponse) em APIError and nas subclasses ValidationError, AuthenticationError, AuthorizationError e NotFoundError; atualize as assinaturas de constructor e a propriedade pública response no class APIError para usar esse tipo, garantindo consistência em todas as referências (APIError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError).



Review completed ✔
