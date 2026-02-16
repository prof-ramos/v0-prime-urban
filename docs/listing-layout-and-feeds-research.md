# Layout de Listagens e Integração com Feeds de Dados
## Referências para SaaS de Imóveis

**Data:** 2026-02-15
**Fontes:** Ideiaimobi, OLX, ZAP/VivaReal, Jetimob, e portais regionais

---

## 1. Layout de Listagens - Análise de Referências

### Grandes Portais Brasileiros

#### ZAP Imóveis e VivaReal
**Padrões de UX observados:**
- **Busca avançada com filtros laterais** ou em barra superior
- **Cards informativos** com: imagem principal, preço destacado, quartos/áreas/vagas, localização
- **Galeria de fotos** com navegação por setas ou thumbnails
- **Badges visuais**: "Destaque", "Lançamento", "Oportunidade"
- **Indicadores de contato**: WhatsApp, telefone, formulário

#### OLX (para proprietários diretos)
**Simplificações observadas:**
- **Fluxo de cadastro rápido**: 3-4 passos máximos
- **Fotos via celular**: upload direto da galeria
- **Títulos simples**: "Apartamento 3 quartos Asa Sul"
- **Preço visible** sem taxas ocultas
- **Contato direto**: WhatsApp do anunciante

### Layout Atual do Prime Urban

**Arquivo:** `components/property-card.tsx`

```typescript
<Card>
  {/* Aspect ratio 4:3 para imagem */}
  <div className="aspect-[4/3]">
    <Image />
    {/* Badges: Venda/Aluguel, Destaque */}
    {/* Botão favoritar */}
    {/* Label do tipo */}
  </div>

  <CardContent>
    {/* Localização com ícone MapPin */}
    {/* Título com link hover */}
    {/* Preço + custo mensal (cond. + IPTU) */}
    {/* Grid de características: Área, Quartos, Banheiros, Vagas */}
  </CardContent>
</Card>
```

**Pontos Fortes:**
- ✅ Design limpo e profissional
- ✅ Informações essenciais visíveis
- ✅ Otimizado com `content-visibility: auto`
- ✅ React.memo para performance

**Oportunidades de Melhoria:**
- 🔄 Adicionar badge "Novo" para imóveis recentes (últimos 7 dias)
- 🔄 Mostrar vídeo nos cards (se disponível)
- 🔄 Indicador de "última atualização"
- 🔄 Comparar com ZAP/VivaReal para otimizar layout

---

## 2. Integração com Feeds de Portais

### Padrão OLX XML

**Documentação:** [developers.olx.com.br](https://developers.olx.com.br/anuncio/xml/real_estate/home.html)

**Estrutura Básica:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<Imoveis>
  <Imovel>
    <CodigoImovel>REF123</CodigoImovel>
    <TituloAnuncio>Apartamento 4 quartos Asa Sul</TituloAnuncio>
    <SubTipoImovel>Apartamento</SubTipoImovel>
    <CEP>70350000</CEP>
    <Observacao>Descrição completa do imóvel...</Observacao>
    <PrecoVenda>850000</PrecoVenda>
    <PrecoLocacao>3500</PrecoLocacao>
    <PrecoCondominio>800</PrecoCondominio>
    <ValorIPTU>250</ValorIPTU>
    <AreaTotal>120</AreaTotal>
    <AreaUtil>100</AreaUtil>

    <Fotos>
      <Foto>
        <URLArquivo>https://exemplo.com/foto1.jpg</URLArquivo>
        <Principal>1</Principal>
      </Foto>
      <Foto>
        <URLArquivo>https://exemplo.com/foto2.jpg</URLArquivo>
      </Foto>
    </Fotos>

    <Videos>
      <Video>https://www.youtube.com/watch?v=xxx</Video>
    </Videos>
  </Imovel>
</Imoveis>
```

**Campos Obrigatórios OLX:**
| Tag | Descrição |
|-----|-----------|
| `CodigoImovel` | ID único (max 20 chars) |
| `SubTipoImovel` | Categoria (Apartamento, Casa, etc.) |
| `CEP` | Código de endereçamento |
| `Observacao` | Descrição (max 6000 chars) |

**Requisitos para Publicação:**
- ✅ Imóvel com status ATIVO
- ✅ Pelo menos 1 foto
- ✅ Dados completos (título, descrição, preço, endereço)
- ✅ URL pública do XML (acessível 24/7)

**Contato OLX para Integração:**
```
Email: suporteintegrador@olxbr.com
Assunto: Integração XML – [Nome da Imobiliária]
Conteúdo: Email cadastro OLX Pro + Link do XML
```

### Padrão ZAP/VivaReal (VrSync)

**Formatos Suportados:** VrSync (padrão Grupo OLX)

**Estrutura Típica VrSync:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<Carga>
  <Imoveis>
    <Imovel>
      <CodigoImovel>REF123</CodigoImovel>
      <TipoImovel>Apartamento</TipoImovel>
      <SubTipoImovel>Padrão</SubTipoImovel>
      <CategoriaImovel>Usado</CategoriaImovel>

      <Titulo>Apartamento 4 quartos com vista</Titulo>
      <Descricao>Descrição completa...</Descricao>

      <TipoOferta>Venda</TipoOferta>
      <Preco>850000</Preco>
      <PrecoCondominio>800</PrecoCondominio>
      <PrecoIPTU>250</PrecoIPTU>

      <AreaUtil>100</AreaUtil>
      <AreaTotal>120</AreaTotal>
      <QuantidadeQuartos>4</QuantidadeQuartos>
      <QuantidadeSuites>2</QuantidadeSuites>
      <QuantidadeBanheiros>3</QuantidadeBanheiros>
      <QuantidadeVagas>2</QuantidadeVagas>

      <Endereco>
        <Logradouro>SQS 308</Logradouro>
        <Numero>Bloco A</Numero>
        <Bairro>Asa Sul</Bairro>
        <Cidade>Brasília</Cidade>
        <Estado>DF</Estado>
        <CEP>70350000</CEP>
      </Endereco>

      <Fotos>
        <Foto>
          <URLArquivo>https://exemplo.com/foto1.jpg</URLArquivo>
          <Principal>true</Principal>
        </Foto>
      </Fotos>

      <Video>https://www.youtube.com/watch?v=xxx</Video>
    </Imovel>
  </Imoveis>
</Carga>
```

---

## 3. Implementação de Feed XML no Prime Urban

### Estrutura de Arquivos Proposta

```
app/api/
  ├── feed/
  │   ├── olx/
  │   │   └── route.ts      # /api/feed/olx
  │   ├── zap/
  │   │   └── route.ts      # /api/feed/zap
  │   └── vivalreal/
  │       └── route.ts      # /api/feed/vivalreal
  └── leads/
      └── route.ts          # Webhook para receber leads
```

### Exemplo de Implementação (OLX)

```typescript
// app/api/feed/olx/route.ts
import { NextResponse } from 'next/server'
import { getProperties } from '@/lib/api'
import { escapeXML } from '@/lib/utils'

export const revalidate = 300 // Revalida a cada 5 minutos

export async function GET() {
  const properties = await getProperties()

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<Imoveis>
${properties.map(property => `
  <Imovel>
    <CodigoImovel>${escapeXML(property.id)}</CodigoImovel>
    <TituloAnuncio>${escapeXML(property.title)}</TituloAnuncio>
    <SubTipoImovel>${escapeXML(property.type)}</SubTipoImovel>
    <CEP>${property.cep || ''}</CEP>
    <Observacao>${escapeXML(property.description || '')}</Observacao>
    ${property.transactionType === 'venda'
      ? `<PrecoVenda>${property.price}</PrecoVenda>`
      : `<PrecoLocacao>${property.price}</PrecoLocacao>`
    }
    ${property.condominiumFee
      ? `<PrecoCondominio>${property.condominiumFee}</PrecoCondominio>`
      : ''
    }
    ${property.iptu ? `<ValorIPTU>${property.iptu}</ValorIPTU>` : ''}
    <AreaUtil>${property.privateArea}</AreaUtil>
    ${property.totalArea ? `<AreaTotal>${property.totalArea}</AreaTotal>` : ''}

    <Fotos>
      ${property.images.map((img, idx) => `
      <Foto>
        <URLArquivo>${escapeXML(img)}</URLArquivo>
        ${idx === 0 ? '<Principal>1</Principal>' : ''}
      </Foto>`).join('')}
    </Fotos>
  </Imovel>`).join('')}
</Imoveis>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  })
}
```

### Mapeamento de Tipos

| Prime Urban | OLX | ZAP/VivaReal |
|-------------|-----|--------------|
| `apartamento` | Apartamento | Apartamento |
| `casa` | Casa | Casa |
| `cobertura` | Apartamento | Cobertura |
| `sala_comercial` | Comércio e Indústria | Comercial |

| Prime Urban | Transaction Type |
|-------------|------------------|
| `venda` | Venda |
| `aluguel` | Locação |

---

## 4. Funcionalidades Inspiradas no Ideiaimobi

### Já Implementado ✅
- [x] Cadastro completo de imóveis (via Payload CMS)
- [x] Upload de fotos (Media do Payload)
- [x] Filtros de busca avançados
- [x] Site responsivo

### Próximas Implementações

#### Alta Prioridade
1. **Integração com Portais via Feed XML**
   - `/api/feed/olx` - Feed para OLX
   - `/api/feed/zap` - Feed para ZAP
   - `/api/feed/vivalreal` - Feed para VivaReal

2. **Geração de Descrições com IA**
   ```typescript
   // app/api/generate-description/route.ts
   export async function POST(req: Request) {
     const { property } = await req.json()
     // Gera descrição otimizada via AI
   }
   ```

3. **Webhook para Leads**
   ```typescript
   // app/api/leads/route.ts
   export async function POST(req: Request) {
     // Recebe leads dos portais
     // Armazena no Payload (coleção Leads)
   }
   ```

#### Média Prioridade
4. **Dashboard de Métricas**
   - Visualizações por imóvel
   - Leads recebidos
   - Origem dos contatos

5. **Galeria de Vídeos**
   - Upload via YouTube/Vimeo
   - Exibição no card de listagem

---

## 5. Diferenciais Competitivos

### Comparativo com SaaS Existentes

| Funcionalidade | Prime Urban | Ideiaimobi | Jetimob |
|----------------|-------------|------------|---------|
| Site integrado | ✅ | ✅ | ✅ |
| Feed XML portais | 🔜 Próximo | ✅ | ✅ |
| IA em descrições | 🔜 Próximo | ✅ | ❌ |
| CRM/Pipeline | 🔜 Simples | ✅ Completo | ✅ Completo |
| Custo | $0 (auto-hospedado) | $$ | $$$ |

### Foco: Proprietário + 1 Funcionário

**Simplificações possíveis:**
- Sem login para corretores
- Sem pipeline complexo de vendas
- Foco em publicação e captação de leads
- CRM simplificado (contatos e follow-ups)

---

## 6. Roadmap de Implementação

> **Nota:** Integração com Feeds XML foi movida para **futuro** - não é prioridade atual.

### Fase Atual: Funcionalidades Core
- [ ] Finalizar migração Payload CMS
- [ ] Popular banco com dados reais
- [ ] Testar fluxo completo de cadastro e exibição

### Fase 1: Feeds XML (BACKLOG - Futuro)
- [ ] Implementar `/api/feed/olx`
- [ ] Implementar `/api/feed/zap` (VrSync)
- [ ] Testar com ambientes de sandbox

### Fase 2: Melhorias de UX (1 semana)
- [ ] Badge "Novo" nos cards
- [ ] Indicador de última atualização
- [ ] Vídeos na galeria

### Fase 3: IA e Automação (2 semanas)
- [ ] Geração de descrições com IA
- [ ] Webhook para leads de portais
- [ ] Dashboard de métricas

### Fase 4: CRM Simplificado (2 semanas)
- [ ] Coleção `Leads` no Payload
- [ ] Página de gestão de leads
- [ ] Integração com WhatsApp

---

## Fontes

- [Ideiaimobi - Soluções](https://www.ideiaimobi.com.br/solucao)
- [OLX - Documentação XML Imóveis](https://developers.olx.com.br/anuncio/xml/real_estate/home.html)
- [Grupo OLX - Formatos XML](https://developers.grupozap.com/feeds/xml-formats/)
- [ImobiePro - Configuração Feed XML](https://ajuda.imobiepro.com.br/imobiepro/integracoes/integracao-com-a-olx-configuracao-do-feed-xml/)
