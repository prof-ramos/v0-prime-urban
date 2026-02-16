# Roadmap - Prime Urban

**Última atualização:** 2026-02-15

---

## 🎯 Fase Atual: Estruturar CMS + CRM próprio

### Status
- ✅ Payload removido da stack
- ✅ Catálogo conectado ao datasource local (`mock-data`)
- ✅ Projeto preparado para novo admin em base MIT
- ⏳ **PRÓXIMO:** iniciar backend CMS/CRM

### Tarefas Pendentes Imediatas
1. [ ] Definir stack de banco e autenticação do admin
2. [ ] Bootstrap do painel admin (base `shadcn-admin`)
3. [ ] Criar entidades CMS (`properties`, `regions`, `media`)
4. [ ] Criar entidades CRM (`leads`, `pipeline_stages`, `agents`)
5. [ ] Integrar formulário de contato com persistência de lead

---

## 📋 Roadmap por Prioridade

### 🔴 Alta Prioridade (Próximas 2-3 semanas)

#### 1. Dados e Testes
- [ ] Popular banco com imóveis reais
- [ ] Testar todos os filtros da listagem
- [ ] Verificar página de detalhe
- [ ] Testar formulário de contato
- [ ] Validar SEO (metadados, sitemap)

#### 2. Melhorias UX
- [ ] Badge "Novo" (últimos 7 dias)
- [ ] Indicador de atualização
- [ ] Loading states otimizados
- [ ] Error states melhorados

### 🟡 Média Prioridade (Próximos 1-2 meses)

#### 3. Funcionalidades de Gestão
- [ ] Dashboard administrativo simples
- [ ] Página de estatísticas
- [ ] Exportação de dados (CSV)
- [ ] Histórico de alterações

#### 4. Melhorias de Performance
- [ ] Otimização de imagens (WebP/AVIF)
- [ ] Lazy loading de componentes
- [ ] Cache estratégico
- [ ] Service Worker atualizado

### 🟢 Baixa Prioridade (Futuro)

#### 5. Integrações
- [ ] **Feed XML para portais** (OLX, ZAP, VivaReal)
- [ ] Webhook para leads
- [ ] Integração WhatsApp API

#### 6. Recursos Avançados
- [ ] Geração de descrições com IA
- [ ] Tours virtuais
- [ ] Comparação de imóveis
- [ ] Mapa interativo

---

## 🚀 Backlog (Ideias)

### Marketing e Vendas
- [ ] Página de "Sobre nós"
- [ ] Blog de conteúdo sobre imóveis
- [ ] Página de avaliações/depoimentos
- [ ] Captura de leads via newsletter

### Técnico
- [ ] Testes E2E com Playwright
- [ ] CI/CD via GitHub Actions
- [ ] Monitoring e alertas
- [ ] Backup automatizado

---

## 📊 Métricas de Sucesso

### Curto Prazo (1 mês)
- [ ] 10 imóveis cadastrados
- [ ] 100 visitantes únicos
- [ ] 5 leads via formulário

### Médio Prazo (3 meses)
- [ ] 50 imóveis cadastrados
- [ ] 1000 visitantes únicos/mês
- [ ] 20 leads qualificados

### Longo Prazo (6 meses)
- [ ] 100+ imóveis
- [ ] Integração com portais
- [ ] ROI positivo

---

## 📝 Notas

- **Stack:** Next.js 16, React 19, CMS/CRM a definir
- **Hosting:** Vercel (front) + infraestrutura de dados a definir
- **Custo estimado:** R$ 0-50/mês (free tiers)
- **Time:** 1 desenvolvedor

### Links Úteis
- [Exemplo Admin MIT (shadcn-admin)](https://github.com/satnaing/shadcn-admin)
- [Integração OLX](https://developers.olx.com.br/anuncio/xml/real_estate/home.html)
- [Guia Next.js 16](https://nextjs.org/docs)
