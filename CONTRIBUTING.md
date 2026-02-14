# Contribuindo com o PrimeUrban

Obrigado por interessar-se em contribuir com o PrimeUrban! Este guia ajudará você a começar.

---

## 🚀 Desenvolvimento Local

### Pré-requisitos

- **Node.js** 18+ instalado
- **pnpm** (recomendado) ou npm
- **Git** para controle de versão

### Setup do Ambiente

1. **Fork o repositório**
   ```bash
   # Clique em "Fork" no GitHub e clone seu fork
   git clone https://github.com/SEU_USUARIO/v0-prime-urban.git
   cd v0-prime-urban
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000)

---

## 📋 Convenções de Commit

Usamos **Conventional Commits** para manter o histórico claro e organizado:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat:` | Nova funcionalidade | `feat: adicionar filtro por preço` |
| `fix:` | Correção de bug | `fix: corrigir filtro de bairro com acentos` |
| `perf:` | Otimização de performance | `perf: implementar O(1) lookups com Maps` |
| `docs:` | Documentação | `docs: atualizar README com novas features` |
| `style:` | Formatação/código | `style: ajustar indentação` |
| `refactor:` | Refatoração | `refactor: extrair lógica de filtros` |
| `test:` | Testes | `test: adicionar testes para formatCurrency` |
| `chore:` | Tarefas variadas | `chore: atualizar dependências` |

### Exemplo de Commit Bem Formatado

```bash
git commit -m "feat: implementar PWA service worker

- Adicionar sw.js com estratégias de cache
- Configurar pre-caching de assets estáticos
- Implementar cache first para imagens

Refs: #12"
```

---

## 🔧 Pull Requests

### Processo de PR

1. **Crie uma branch** para sua feature/bugfix
   ```bash
   git checkout -b feature/minha-nova-feature
   # ou
   git checkout -b fix/corrigir-alguma-coisa
   ```

2. **Faça commits atômicos** e descritivos
   - Um commit por mudança lógica
   - Mensagens claras seguindo Conventional Commits

3. **Push para seu fork**
   ```bash
   git push origin feature/minha-nova-feature
   ```

4. **Abra o PR** no GitHub com:
   - Título claro (ex: "feat: add filter by neighborhood")
   - Descrição detalhada do que foi mudado e por quê
   - Screenshots se aplicável (mudanças visuais)
   - Referência a issues relacionadas (fixes #XX)

### Checklist de Revisão

Antes de abrir o PR, verifique:
- [ ] Código segue as convenções do projeto (veja `CLAUDE.md`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)
- [ ] Linter passa (`npm run lint`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] Commits seguem Conventional Commits
- [ ] Documentação atualizada se necessário

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
app/                    # Next.js App Router
├── layout.tsx          # Layout root
├── page.tsx            # Homepage
├── imoveis/            # Rotas de imóveis
└── globals.css         # Estilos globais

components/             # Componentes React
├── ui/                 # shadcn/ui base
└── *.tsx               # Componentes de domínio

lib/                    # Utilitários
├── constants.ts        # Constantes centralizadas
├── types.ts            # Tipos TypeScript
├── utils.ts            # Funções helper
└── mock-data.ts        # Dados mockados

public/                 # Assets estáticos
├── sw.js               # Service Worker
├── manifest.json       # PWA manifest
└── icon-*.png          # Ícones
```

### Convenções de Código

**Componentes:**
- PascalCase: `PropertyCard`, `Header`
- Use `React.memo` para componentes em listas
- Client components: `"use client"` no topo

**Funções/Hooks:**
- camelCase: `formatCurrency`, `useFilters`
- `useCallback` para funções em dependências
- `useMemo` para valores computados

**Constantes:**
- SCREAMING_SNAKE_CASE: `PROPERTY_TYPE_LABELS`
- Centralizar em `lib/constants.ts`

**Tipos:**
- PascalCase: `Property`, `FilterState`
- Interfaces para objetos, types para unions
- Sem `any` - usar tipos específicos

---

## 🎨 Design Tokens

Respeite os design tokens definidos em `app/globals.css`:

```css
--primary-brand: #1D2D3A      /* Azul marinho - CTAs */
--secondary-brand: #B68863    /* Azul acinzentado - suporte */
--accent-brand: #3D4D55       /* Dourado - badges, preços */
--background: #F9F6F0         /* Creme - fundo */
--whatsapp: #25D366           /* Verde WhatsApp */
```

**Tipografia:**
- Títulos: Playfair Display
- Corpo: Inter

---

## ⚡ Performance

O projeto segue **Vercel React Best Practices**. Antes de otimizar:

1. **Leia a documentação de performance:**
   - `PERFORMANCE_REPORT.md` - Análise completa
   - `PERFORMANCE_BACKLOG.md` - Tarefas priorizadas

2. **Use os padrões existentes:**
   - O(1) lookups com Maps
   - React.memo com comparação customizada
   - Dynamic imports para code splitting
   - Content-visibility CSS para longas listas

3. **Mude com cautela:**
   - Performance docs mostram o que já foi otimizado
   - Teste mudanças com Lighthouse
   - Documente melhorias no CHANGELOG.md

---

## 🐛 Reporting Bugs

### Template de Issue

```markdown
## Descrição
Breve descrição do bug.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role para '....'
4. Veja o erro

## Comportamento Esperado
Descrição clara do que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- OS: [ex: macOS 14.0]
- Browser: [ex: Chrome 120]
- Node version: [ex: 18.19.0]
- Project version: [ex: v0.4.0]

## Logs Adicionais
Cole logs relevantes ou stack traces.
```

---

## 💡 Sugestões de Features

### Template de Request

```markdown
## Resumo da Feature
Breve descrição da funcionalidade sugerida.

## Problema que Resolve
Qual problema dos usuários isso resolve?

## Solução Proposta
Descrição detalhada de como a feature deveria funcionar.

## Alternativas Consideradas
Outras abordagens que você considerou.

## Contexto Adicional
Mockups, exemplos, ou referências.
```

---

## 📚 Recursos de Aprendizado

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### React
- [React Documentation](https://react.dev)
- [Vercel React Best Practices](https://github.com/vercel/react-core)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Performance
- [Web.dev Performance](https://web.dev/performance/)
- [Vercel Analytics](https://vercel.com/analytics)

---

## 🤝 Código de Conduta

Seja respeitoso, construtivo e inclusivo. Discussions e PRs devem ser profissionais e produtivos.

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](LICENSE).

---

**Obrigado por contribuir! 🙏**
