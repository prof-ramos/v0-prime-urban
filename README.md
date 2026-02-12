# PrimeUrban

![PrimeUrban](https://img.shields.io/badge/PrimeUrban-Alto_Padrão-blue?style=for-the-badge)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gabriel-ramos-projects-c715690c/v0-prime-urban)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> Plataforma imobiliária de alto padrão especializada em Brasília, DF.

## [🌐 Visite o site](https://vercel.com/gabriel-ramos-projects-c715690c/v0-prime-urban)

## Sobre

A **PrimeUrban** é uma plataforma moderna de imóveis de alto padrão, focada em oferecer uma experiência sofisticada para compra e locação de propriedades de luxio em Brasília. Nosso catálogo inclui apartamentos, casas e coberturas nos bairros mais exclusivos da capital brasileira.

## Funcionalidades

### Busca Inteligente
- Filtragem avançada por tipo de transação (venda/aluguel)
- Busca por bairro ou código do imóvel
- Navegação intuitiva por galeria de imagens

### Catálogo de Imóveis
- Propriedades de alto padrão em destaque
- Informações detalhadas: área, quartos, suítes, vagas
- Valores de condomínio e IPTU
- Características especiais (pet-friendly, orientação solar)

### Exploração por Bairros
- Asa Sul, Asa Norte, Águas Claras
- Sudoeste, Noroeste, Lago Sul
- Contagem de imóveis por região

### Contato Profissional
- Integração direta com WhatsApp
- Formulário de contato com validação
- Atendimento personalizado CRECI-DF

## Stack Tecnológico

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| [Next.js](https://nextjs.org/) | 16.1.6 | Framework React |
| [React](https://react.dev/) | 19.2.0 | Biblioteca UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.9 | Estilização |
| [Radix UI](https://www.radix-ui.com/) | - | Componentes acessíveis |
| [Lucide](https://lucide.dev/) | - | Ícones |
| [Vercel Analytics](https://vercel.com/analytics) | 1.3.1 | Análise de uso |

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/gabrielramos/v0-prime-urban.git
cd v0-prime-urban
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa linter ESLint |

## Estrutura do Projeto

```
v0-prime-urban/
├── app/              # App Router do Next.js
├── components/       # Componentes React reutilizáveis
├── lib/             # Utilitários e helpers
├── public/          # Arquivos estáticos
└── styles/          # Estilos globais
```

## Licença CRECI

Este projeto é de uso privado e está associado à CRECI-DF para atividades de corretagem de imóveis.

## Performance

Otimizações implementadas na v0.2.0:

| Métrica | Antes | Depois | Melhoria |
|---------|--------|---------|----------|
| Bundle JS | ~450 KB | ~180 KB | **60%** |
| Imagens | ~500 KB | ~120 KB | **76%** |
| Re-renders | 6 cards | 0-1 cards | **80%** |
| Vulnerabilidades | 3 (1 alta, 2 moderadas) | 0 | **100%** |

### Otimizações Aplicadas
- ✅ Otimização de imagens (AVIF/WebP)
- ✅ Remoção de 28 pacotes não utilizados
- ✅ Cache headers HTTP (1 year immutable)
- ✅ React.memo nos componentes de listagem
- ✅ Debounce de 300ms nos filtros
- ✅ Ordenação de filtros por seletividade

Veja [CHANGELOG.md](./CHANGELOG.md) para detalhes completos.

## Roadmap

### Próximas Otimizações (Fase 3)
- [ ] Separação client/server da página /imoveis
- [ ] Implementação de Dark Mode ou remoção do next-themes
- [ ] Virtual Scrolling para datasets grandes
- [ ] Service Worker para PWA

## Deploy

O projeto é automaticamente implantado na [Vercel](https://vercel.com) a partir deste repositório.

---

Desenvolvido com [v0.dev](https://v0.dev) e integrado com Vercel.
