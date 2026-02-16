# Requisitos de VPS - PrimeUrban Stack MIT/OpenSource

**Documento Técnico de Especificação de Infraestrutura**
*Última atualização: Fevereiro 2026*
*Versão: 1.0*

---

## 1. Resumo Executivo

Este documento especifica os requisitos de hardware, software e rede para deployment da stack PrimeUrban CMS+CRM 100% MIT/OpenSource em VPS self-hosted.

**Stack Completa:**
- Next.js 16 (App) + Payload CMS 3.x (Admin)
- PostgreSQL 16 + pgBouncer
- MinIO (S3-compatible storage)
- PostHog (Analytics self-hosted)
- GlitchTip (Error tracking)
- Uptime Kuma (Monitoring)
- Grafana Loki + Promtail (Logs)
- Caddy (Reverse proxy + HTTPS)

---

## 2. Especificação de Hardware

### 2.1 Perfil de Uso Estimado

**Cenário Base (MVP):**
- 5.000 imóveis cadastrados
- 500 imóveis com galeria completa (15 fotos/imóvel = 7.500 imagens)
- 100 leads novos/mês
- 1.000 visitantes únicos/mês
- 10.000 page views/mês
- 3 usuários admin simultâneos
- 50GB de mídia (imagens WebP otimizadas)

**Cenário Crescimento (12 meses):**
- 10.000 imóveis cadastrados
- 2.000 leads novos/mês
- 5.000 visitantes únicos/mês
- 50.000 page views/mês
- 5 usuários admin simultâneos
- 150GB de mídia

### 2.2 Configuração Mínima (MVP - 6 meses)

| Componente | Especificação | Justificativa |
|-----------|---------------|---------------|
| **vCPU** | 4 cores | Next.js (2), PostgreSQL (1), PostHog (1) |
| **RAM** | 8 GB | PostgreSQL (2GB), Next.js (2GB), PostHog (2GB), MinIO (1GB), sistema (1GB) |
| **Storage** | 100 GB SSD NVMe | Sistema (20GB), PostgreSQL (15GB), MinIO (50GB), logs (10GB), backups (5GB) |
| **Bandwidth** | 2 TB/mês | Imagens (1.5TB), API (300GB), backups (200GB) |
| **Network** | 1 Gbps | - |
| **Tipo** | Dedicated vCPU | Evitar CPU steal em ambientes compartilhados |

**Custo Estimado:** $40-60/mês (Hetzner, DigitalOcean, Vultr)

### 2.3 Configuração Recomendada (Produção - 12+ meses)

| Componente | Especificação | Justificativa |
|-----------|---------------|---------------|
| **vCPU** | 8 cores | Next.js (3), PostgreSQL (2), PostHog (2), Sharp (1) |
| **RAM** | 16 GB | PostgreSQL (4GB), Next.js (4GB), PostHog (4GB), MinIO (2GB), sistema (2GB) |
| **Storage** | 300 GB SSD NVMe | Sistema (20GB), PostgreSQL (50GB), MinIO (180GB), logs (30GB), backups (20GB) |
| **Bandwidth** | 5 TB/mês | Imagens (4TB), API (600GB), backups (400GB) |
| **Network** | 1 Gbps | - |
| **Tipo** | Dedicated vCPU | - |

**Custo Estimado:** $80-120/mês (Hetzner CPX51, DigitalOcean Premium)

### 2.4 Configuração Enterprise (Alta Demanda)

| Componente | Especificação | Justificativa |
|-----------|---------------|---------------|
| **vCPU** | 16 cores | Separação de workloads, alto paralelismo |
| **RAM** | 32 GB | Cache PostgreSQL (8GB), Next.js (8GB), PostHog (8GB), MinIO (4GB), sistema (4GB) |
| **Storage** | 500 GB SSD NVMe | PostgreSQL (100GB), MinIO (300GB), logs (50GB), backups (50GB) |
| **Bandwidth** | 10 TB/mês | - |
| **Network** | 1 Gbps | - |
| **Tipo** | Dedicated vCPU | - |

**Custo Estimado:** $150-220/mês

---

## 3. Breakdown por Serviço

### 3.1 Next.js 16 + Payload CMS

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 2 cores | 3 cores | 6 cores |
| RAM | 2 GB | 4 GB | 8 GB |
| Storage | 5 GB | 10 GB | 20 GB |
| Portas | 3000 | 3000 | 3000 |

**Justificativa:**
- Next.js standalone build (~30MB)
- Payload admin bundle (~10MB)
- Node.js heap: 512MB base + 1.5GB working set
- SSR: 200ms/request × 10 req/s = 2GB RAM buffer

### 3.2 PostgreSQL 16

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 1 core | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB | 8 GB |
| Storage | 15 GB | 50 GB | 100 GB |
| Portas | 5432 | 5432 | 5432 |

**Justificativa:**
- shared_buffers: 25% RAM (500MB → 1GB → 2GB)
- effective_cache_size: 50% RAM (1GB → 2GB → 4GB)
- work_mem: 16MB × 10 conexões = 160MB
- Índices: ~30% do tamanho dos dados
- WAL files: 1GB reserved

**Configuração `postgresql.conf`:**

```ini
# Configuração MVP (8GB RAM VPS)
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1  # SSD
effective_io_concurrency = 200  # SSD
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 100

# Full-text search
shared_preload_libraries = 'pg_trgm'
```

### 3.3 pgBouncer

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.5 core | 0.5 core | 1 core |
| RAM | 256 MB | 512 MB | 1 GB |
| Storage | 100 MB | 100 MB | 100 MB |
| Portas | 6432 | 6432 | 6432 |

**Justificativa:**
- Lightweight proxy (~50MB footprint)
- Transaction pooling: 1000 client → 25 server connections
- Reduced PostgreSQL connection overhead

### 3.4 MinIO

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.5 core | 1 core | 2 cores |
| RAM | 1 GB | 2 GB | 4 GB |
| Storage | 50 GB | 180 GB | 300 GB |
| Portas | 9000, 9001 | 9000, 9001 | 9000, 9001 |

**Justificativa:**
- 7.500 imagens × 5MB avg (original) = 37.5GB
- Sharp processed (WebP 85%): 7.500 × 2MB = 15GB
- Thumbnails: 7.500 × 200KB = 1.5GB
- Total: ~54GB (com crescimento)
- Overhead: metadata + erasure coding

**Configuração MinIO:**

```bash
# Variáveis de ambiente
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<strong-password>
MINIO_BROWSER=on
MINIO_DOMAIN=minio.primeUrban.com

# Buckets necessários
- primeUrban (imagens públicas)
- primeUrban-backups (privado)
```

### 3.5 PostHog (Self-Hosted)

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 1 core | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB | 8 GB |
| Storage | 5 GB | 15 GB | 30 GB |
| Portas | 8000 | 8000 | 8000 |

**Justificativa:**
- ClickHouse (analytics DB): 1GB RAM base
- Redis (queue): 512MB
- PostHog app: 512MB
- Session replays: 50MB/1000 sessions
- Events storage: 10GB/100K events/mês

**Dependências:**
- Redis (512MB RAM)
- ClickHouse ou PostgreSQL (compartilhado)

### 3.6 GlitchTip

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.5 core | 1 core | 2 cores |
| RAM | 512 MB | 1 GB | 2 GB |
| Storage | 2 GB | 5 GB | 10 GB |
| Portas | 8080 | 8080 | 8080 |

**Justificativa:**
- Django app: 256MB
- Celery workers: 256MB
- Error storage: 1GB/10K errors

### 3.7 Uptime Kuma

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.25 core | 0.25 core | 0.5 core |
| RAM | 256 MB | 512 MB | 512 MB |
| Storage | 500 MB | 1 GB | 2 GB |
| Portas | 3001 | 3001 | 3001 |

**Justificativa:**
- Node.js app: 128MB
- SQLite database: 100MB
- Monitoring de 10-20 endpoints

### 3.8 Grafana Loki + Promtail

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.5 core | 1 core | 2 cores |
| RAM | 512 MB | 1 GB | 2 GB |
| Storage | 5 GB | 20 GB | 40 GB |
| Portas | 3100 (Loki) | 3100 | 3100 |

**Justificativa:**
- Loki: 256MB base
- Log retention: 7 dias (5GB/dia em produção)
- Promtail: 128MB

### 3.9 Caddy

| Métrica | MVP | Produção | Enterprise |
|---------|-----|----------|-----------|
| vCPU | 0.5 core | 1 core | 2 cores |
| RAM | 256 MB | 512 MB | 1 GB |
| Storage | 500 MB | 1 GB | 2 GB |
| Portas | 80, 443 | 80, 443 | 80, 443 |

**Justificativa:**
- Lightweight reverse proxy (~50MB)
- TLS termination: cert cache (100MB)
- Access logs: 1MB/dia × 30 = 30MB

---

## 4. Storage Breakdown Detalhado

### 4.1 PostgreSQL Database

| Tabela | MVP | Produção | Observação |
|--------|-----|----------|-----------|
| properties | 5.000 × 10KB = 50MB | 10.000 × 10KB = 100MB | Inclui full-text tsvector |
| media | 7.500 × 2KB = 15MB | 30.000 × 2KB = 60MB | Metadata apenas |
| leads | 600 × 5KB = 3MB | 3.000 × 5KB = 15MB | 6 meses de histórico |
| activities | 2.000 × 2KB = 4MB | 10.000 × 2KB = 20MB | - |
| deals | 100 × 3KB = 300KB | 500 × 3KB = 1.5MB | - |
| neighborhoods | 50 × 5KB = 250KB | 100 × 5KB = 500KB | - |
| users | 10 × 2KB = 20KB | 20 × 2KB = 40KB | - |
| **Índices** | ~30MB | ~90MB | 30% do tamanho total |
| **WAL** | 1GB | 2GB | Write-ahead logs |
| **PostHog DB** | 3GB | 10GB | Events + session replays |
| **GlitchTip DB** | 1GB | 3GB | Error events |
| **Total** | ~15GB | ~50GB | - |

### 4.2 MinIO Storage

| Tipo de Arquivo | Quantidade | Tamanho Médio | Total |
|----------------|-----------|---------------|-------|
| Imagens originais | 7.500 | 5 MB | 37.5 GB |
| WebP otimizadas | 7.500 | 2 MB | 15 GB |
| Thumbnails | 7.500 | 200 KB | 1.5 GB |
| AVIF fallback | 7.500 | 1.5 MB | 11.25 GB |
| **Subtotal (imagens)** | - | - | **~65 GB** |
| Backups PostgreSQL | 7 daily | 2 GB | 14 GB |
| Backups comprimidos | - | - | 7 GB |
| **Total MVP** | - | - | **~86 GB** → **100 GB** (com margem) |
| **Total Produção** | - | - | **~180 GB** |

### 4.3 Logs (Loki)

| Fonte | Volume/Dia | Retenção | Total |
|-------|-----------|----------|-------|
| Next.js access | 1 MB | 7 dias | 7 MB |
| Next.js error | 500 KB | 7 dias | 3.5 MB |
| PostgreSQL | 2 MB | 7 dias | 14 MB |
| Caddy access | 5 MB | 7 dias | 35 MB |
| PostHog | 10 MB | 7 dias | 70 MB |
| **Total MVP** | ~20 MB/dia | 7 dias | **~150 MB** |
| **Total Produção** | ~100 MB/dia | 7 dias | **~700 MB** |

---

## 5. Network Requirements

### 5.1 Bandwidth Estimado

**MVP (1.000 visitantes/mês, 10.000 page views):**

| Tipo de Tráfego | Por Request | Requests/Mês | Total |
|----------------|-------------|--------------|-------|
| HTML (SSR) | 50 KB | 10.000 | 500 MB |
| CSS/JS | 300 KB | 10.000 | 3 GB |
| Imagens (WebP) | 2 MB × 3/page | 30.000 | 60 GB |
| Thumbnails | 200 KB × 10/listagem | 50.000 | 10 GB |
| API calls | 5 KB | 50.000 | 250 MB |
| PostHog events | 2 KB | 100.000 | 200 MB |
| **Downstream Total** | - | - | **~74 GB** |
| Admin uploads (incoming) | - | - | 5 GB |
| Backups (egress) | - | - | 10 GB |
| **Total Mensal** | - | - | **~90 GB** |

**Com margem de segurança:** 2 TB/mês (22x overhead para picos)

**Produção (5.000 visitantes/mês, 50.000 page views):**

| Tipo de Tráfego | Total |
|----------------|-------|
| HTML + Assets | 25 GB |
| Imagens | 300 GB |
| API | 1.25 GB |
| PostHog | 1 GB |
| **Downstream Total** | **~327 GB** |
| Uploads + Backups | 30 GB |
| **Total Mensal** | **~360 GB** |

**Com margem de segurança:** 5 TB/mês

### 5.2 Latência

| Métrica | Alvo | Observação |
|---------|------|-----------|
| VPS → User (Brasil) | < 30ms | Escolher datacenter São Paulo ou Brasil |
| PostgreSQL query | < 50ms | Com índices otimizados |
| MinIO GET | < 100ms | Disk I/O + network |
| PostHog event | < 20ms | Async, non-blocking |
| Sharp processing | < 3s | WebP conversion 1920×1080 |

### 5.3 Portas Expostas

| Serviço | Porta | Protocolo | Acesso Público |
|---------|-------|-----------|----------------|
| Caddy HTTP | 80 | TCP | ✅ (redirect to 443) |
| Caddy HTTPS | 443 | TCP | ✅ |
| SSH | 22 | TCP | ✅ (firewall whitelist) |
| PostgreSQL | 5432 | TCP | ❌ (internal only) |
| pgBouncer | 6432 | TCP | ❌ (internal only) |
| MinIO API | 9000 | TCP | ❌ (via Caddy reverse proxy) |
| MinIO Console | 9001 | TCP | ❌ (via Caddy reverse proxy) |
| PostHog | 8000 | TCP | ❌ (via Caddy reverse proxy) |
| GlitchTip | 8080 | TCP | ❌ (via Caddy reverse proxy) |
| Uptime Kuma | 3001 | TCP | ❌ (via Caddy reverse proxy) |
| Loki | 3100 | TCP | ❌ (internal only) |

**Firewall (UFW) Rules:**

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH (whitelist IPs recomendado)
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

---

## 6. Sistema Operacional

### 6.1 Recomendação

**Ubuntu Server 22.04 LTS** ou **24.04 LTS**

**Justificativa:**
- Suporte de longo prazo (5 anos)
- Compatibilidade Docker nativa
- Repositórios atualizados
- Comunidade ativa
- Caddy, PostgreSQL 16, Node.js 20 disponíveis via APT

**Alternativas:**
- Debian 12 (mais estável, menos pacotes recentes)
- Rocky Linux 9 (RHEL-based, mais enterprise)

### 6.2 Software Base Necessário

| Pacote | Versão Mínima | Uso |
|--------|---------------|-----|
| Docker | 24.x | Container runtime |
| Docker Compose | 2.x | Orchestração |
| Node.js | 20.x | Next.js runtime (se não-dockerizado) |
| PostgreSQL Client | 16.x | Backup scripts |
| curl/wget | Latest | Health checks |
| git | Latest | Deploy via CI/CD |
| htop | Latest | Monitoring |
| ncdu | Latest | Disk usage analysis |
| fail2ban | Latest | SSH brute-force protection |
| ufw | Latest | Firewall |

---

## 7. Recomendações de Providers

### 7.1 Brasil (Latência < 20ms)

| Provider | Plano | Especificação | Preço/Mês | Observações |
|----------|-------|---------------|-----------|-------------|
| **HostGator VPS** | VPS 2 | 4 vCPU, 8GB RAM, 120GB SSD | R$ 180 | Datacenter Brasil, bom suporte PT-BR |
| **Locaweb VPS** | Cloud VPS M | 4 vCPU, 8GB RAM, 100GB SSD | R$ 250 | Datacenter São Paulo |
| **AWS Lightsail** | $40 plan | 2 vCPU, 8GB RAM, 160GB SSD | R$ 200 | São Paulo region, managed |
| **KingHost VPS** | VPS 8GB | 4 vCPU, 8GB RAM, 120GB SSD | R$ 220 | Datacenter Porto Alegre |

**Recomendação:** HostGator VPS 2 (melhor custo-benefício, latência local)

### 7.2 Internacional (Custo < Latência)

| Provider | Plano | Especificação | Preço/Mês | Observações |
|----------|-------|---------------|-----------|-------------|
| **Hetzner** | CPX31 | 4 vCPU, 8GB RAM, 160GB SSD | $15 (€14) | Datacenter Finlândia, 180ms BR |
| **DigitalOcean** | Basic Droplet | 4 vCPU, 8GB RAM, 160GB SSD | $48 | Datacenter NY, 120ms BR |
| **Vultr** | High Frequency | 4 vCPU, 8GB RAM, 128GB SSD | $48 | Datacenter Miami, 60ms BR |
| **Linode** | Linode 8GB | 4 vCPU, 8GB RAM, 160GB SSD | $48 | Datacenter Atlanta, 100ms BR |
| **Contabo** | VPS M | 6 vCPU, 16GB RAM, 400GB SSD | €13 (~$14) | Datacenter Alemanha, 200ms BR |

**Recomendação:** Vultr Miami (melhor latência internacional) ou Contabo (melhor custo, mas latência alta)

### 7.3 Critérios de Escolha

| Critério | Peso | Provider Ideal |
|----------|------|---------------|
| Latência Brasil | 40% | HostGator, Locaweb, AWS São Paulo |
| Custo | 30% | Hetzner, Contabo |
| Bandwidth incluído | 15% | Hetzner (20TB), Contabo (32TB) |
| Suporte PT-BR | 10% | HostGator, Locaweb |
| Snapshots/Backups | 5% | DigitalOcean, AWS Lightsail |

**Recomendação Final:**
- **Prioridade Latência:** HostGator VPS 2 (R$ 180/mês)
- **Prioridade Custo:** Hetzner CPX31 ($15/mês) ou Contabo VPS M (€13/mês)
- **Balanceado:** Vultr High Frequency Miami ($48/mês)

---

## 8. Backup Strategy

### 8.1 Backup Automático

**PostgreSQL:**

```bash
# Cron job diário (3:00 AM)
0 3 * * * docker exec primeUrban-db pg_dump -U $DB_USER primeUrban | gzip > /backups/postgres/primeUrban_$(date +\%Y\%m\%d).sql.gz

# Upload para MinIO
0 4 * * * aws s3 cp /backups/postgres/ s3://primeUrban-backups/postgres/ --recursive --endpoint-url=http://localhost:9000

# Retenção: 7 daily, 4 weekly, 3 monthly
```

**MinIO Buckets:**

```bash
# Sync via rclone para backup offsite (opcional)
0 5 * * * rclone sync /data/minio/primeUrban remote:primeUrban-backup
```

**Volumes Docker:**

```bash
# Backup de volumes (semanal)
0 2 * * 0 tar -czf /backups/volumes/docker-volumes_$(date +\%Y\%m\%d).tar.gz /var/lib/docker/volumes/
```

### 8.2 Storage Necessário para Backups

| Tipo | Frequência | Tamanho | Retenção | Total |
|------|-----------|---------|----------|-------|
| PostgreSQL | Diário | 2 GB | 7 dias | 14 GB |
| PostgreSQL | Semanal | 2 GB | 4 semanas | 8 GB |
| PostgreSQL | Mensal | 2 GB | 3 meses | 6 GB |
| MinIO (imagens) | Semanal | 50 GB | 2 semanas | 100 GB |
| Volumes Docker | Semanal | 5 GB | 4 semanas | 20 GB |
| **Total** | - | - | - | **~150 GB** |

**Recomendação:** Usar bucket MinIO separado ou S3-compatible storage externo (Backblaze B2, Wasabi)

---

## 9. Checklist de Setup Inicial

### 9.1 Provisionamento

- [ ] Criar VPS com especificações mínimas (4 vCPU, 8GB RAM, 100GB SSD)
- [ ] Configurar SSH key-based authentication
- [ ] Desabilitar root login via SSH
- [ ] Configurar UFW firewall (portas 22, 80, 443)
- [ ] Instalar fail2ban
- [ ] Configurar timezone (`timedatectl set-timezone America/Sao_Paulo`)
- [ ] Atualizar sistema (`apt update && apt upgrade -y`)

### 9.2 Software Base

- [ ] Instalar Docker (`curl -fsSL https://get.docker.com | sh`)
- [ ] Instalar Docker Compose (`apt install docker-compose-plugin`)
- [ ] Instalar Node.js 20 (se necessário fora do Docker)
- [ ] Instalar PostgreSQL client tools (`apt install postgresql-client-16`)
- [ ] Instalar htop, ncdu, git, curl

### 9.3 Configuração de Rede

- [ ] Apontar DNS A records:
  - `primeUrban.com` → IP do VPS
  - `admin.primeUrban.com` → IP do VPS
  - `posthog.primeUrban.com` → IP do VPS
  - `minio.primeUrban.com` → IP do VPS
  - `errors.primeUrban.com` → IP do VPS
  - `uptime.primeUrban.com` → IP do VPS
- [ ] Aguardar propagação DNS (24-48h)

### 9.4 Deploy Inicial

- [ ] Clonar repositório (`git clone ...`)
- [ ] Configurar `.env` com secrets
- [ ] Criar diretórios de volumes (`mkdir -p /data/{postgres,minio,loki,logs}`)
- [ ] Build de imagens Docker (`docker compose build`)
- [ ] Iniciar stack (`docker compose up -d`)
- [ ] Verificar logs (`docker compose logs -f`)
- [ ] Aguardar Caddy obter certificados Let's Encrypt (~2 min)

### 9.5 Verificação

- [ ] Acessar `https://primeUrban.com` (Next.js)
- [ ] Acessar `https://admin.primeUrban.com` (Payload admin)
- [ ] Acessar `https://posthog.primeUrban.com` (PostHog)
- [ ] Acessar `https://minio.primeUrban.com` (MinIO console)
- [ ] Acessar `https://errors.primeUrban.com` (GlitchTip)
- [ ] Acessar `https://uptime.primeUrban.com` (Uptime Kuma)
- [ ] Testar upload de imagem → Sharp processing → MinIO storage
- [ ] Verificar certificados SSL válidos (Let's Encrypt)

### 9.6 Configuração de Monitoramento

- [ ] Configurar Uptime Kuma monitors para todos os serviços
- [ ] Configurar alertas de e-mail (via Nodemailer SMTP)
- [ ] Configurar PostHog project + API key
- [ ] Configurar GlitchTip project + DSN
- [ ] Adicionar GlitchTip DSN ao `.env` do Next.js

### 9.7 Backup Inicial

- [ ] Executar backup manual do PostgreSQL
- [ ] Verificar backup salvo no MinIO
- [ ] Testar restore do backup (`psql < backup.sql`)
- [ ] Configurar cron jobs de backup automático
- [ ] Documentar procedimento de restore

---

## 10. Custos Mensais Estimados

### 10.1 Stack Completa (MVP)

| Item | Custo | Observação |
|------|-------|-----------|
| **VPS** (4 vCPU, 8GB, 100GB) | $40-60 | Hetzner, DigitalOcean, Vultr |
| **Domínio** (.com) | $1.50 | Namecheap, Cloudflare Registrar |
| **SMTP** (Transacional) | $0 | Gmail SMTP grátis até 500/dia, ou Brevo free tier |
| **Backup Offsite** (opcional) | $0-5 | Backblaze B2: $0.005/GB/mês (100GB = $0.50) |
| **Total Mensal** | **$41.50-66.50** | **R$ 205-330** |

### 10.2 Stack Completa (Produção)

| Item | Custo | Observação |
|------|-------|-----------|
| **VPS** (8 vCPU, 16GB, 300GB) | $80-120 | Hetzner CPX51, DigitalOcean Premium |
| **Domínio** (.com) | $1.50 | - |
| **SMTP** (Transacional) | $0-10 | Brevo: 300/dia free, ou $25/mês 20K emails |
| **Backup Offsite** | $1-2 | Backblaze B2: 200GB |
| **Total Mensal** | **$82.50-133.50** | **R$ 410-660** |

### 10.3 Comparação com Stack Proprietária (Original)

| Item | Proprietária | MIT/OpenSource | Economia |
|------|--------------|----------------|----------|
| Hosting | Vercel Pro $20 | VPS $50 | -$30 |
| Database | Neon Pro $25 | PostgreSQL included | +$25 |
| Storage | Vercel Blob $20 | MinIO included | +$20 |
| CDN/Imagens | Cloudinary $89 | Sharp + MinIO | +$89 |
| E-mail | Resend $20 | Nodemailer SMTP $0 | +$20 |
| Analytics | Vercel Analytics $10 | PostHog self-hosted | +$10 |
| Error Tracking | Sentry $26 | GlitchTip self-hosted | +$26 |
| **Total/Mês** | **$210** | **$50** | **+$160 (76%)** |
| **Total/Ano** | **$2.520** | **$600** | **+$1.920** |
| **Total/3 Anos** | **$7.560** | **$1.800** | **+$5.760** |

**ROI:** Economia de $5.760 em 3 anos, mesmo considerando 10 horas de setup inicial × $50/hora = $500.

---

## 11. Troubleshooting e Manutenção

### 11.1 Comandos Úteis

**Verificar uso de recursos:**

```bash
# CPU e RAM
htop

# Disk usage
df -h
ncdu /data

# Docker containers
docker stats

# Logs em tempo real
docker compose logs -f [service_name]
```

**Verificar saúde dos serviços:**

```bash
# PostgreSQL
docker exec primeUrban-db pg_isready

# MinIO
curl -I http://localhost:9000/minio/health/live

# Next.js
curl -I http://localhost:3000/api/health

# PostHog
curl -I http://localhost:8000/_health
```

**Backup manual:**

```bash
# PostgreSQL
docker exec primeUrban-db pg_dump -U $DB_USER primeUrban > backup_$(date +%Y%m%d).sql

# Restaurar
docker exec -i primeUrban-db psql -U $DB_USER primeUrban < backup_20260216.sql
```

### 11.2 Alertas Críticos

| Alerta | Threshold | Ação |
|--------|-----------|------|
| Disk usage > 80% | 80% | Limpar logs antigos (`find /data/logs -mtime +7 -delete`) |
| RAM usage > 90% | 90% | Restart containers com memory leak |
| PostgreSQL connections > 90 | 90/100 | Verificar pgBouncer, ajustar `max_connections` |
| Error rate > 1% | 1% | Verificar GlitchTip, investigar stack trace |
| Response time > 500ms | 500ms | Verificar slow queries (EXPLAIN ANALYZE), cache hit ratio |

### 11.3 Upgrade Path

**Quando migrar para 16GB RAM:**
- PostgreSQL queries > 100ms frequentes
- Next.js OOM errors
- PostHog session replay lag

**Quando migrar para 300GB Storage:**
- MinIO usage > 70% (70GB)
- PostgreSQL growth > 30GB
- Backup accumulation > 100GB

---

## 12. Segurança

### 12.1 Hardening Checklist

- [ ] SSH: Desabilitar password auth, usar apenas SSH keys
- [ ] SSH: Trocar porta padrão 22 para >10000 (opcional, security by obscurity)
- [ ] Firewall: UFW ativo com whitelist de IPs admin (opcional)
- [ ] Fail2ban: Configurado para SSH, Caddy
- [ ] PostgreSQL: Bind apenas localhost (não expor publicamente)
- [ ] MinIO: Access keys com política least-privilege
- [ ] Secrets: `.env` com permissões 600 (`chmod 600 .env`)
- [ ] Docker: Rodar containers como non-root user
- [ ] Caddy: Headers de segurança (CSP, HSTS, X-Frame-Options)
- [ ] PostgreSQL: Backups encriptados (`gpg`)
- [ ] Auto-updates: `unattended-upgrades` configurado

### 12.2 Vulnerabilidades Conhecidas

**Mitigação de Riscos:**

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| DDoS | Média | Alto | Cloudflare Free (proxy DNS), rate limiting Caddy |
| Brute-force SSH | Alta | Médio | Fail2ban, SSH keys only |
| SQL Injection | Baixa | Alto | Payload ORM (parameterized queries), input validation |
| XSS | Baixa | Médio | React auto-escape, CSP headers |
| Data breach | Baixa | Crítico | Encryption at rest (LUKS volumes), HTTPS only, PostgreSQL SSL |

---

*Documento de Requisitos VPS v1.0 — PrimeUrban Stack MIT/OpenSource*
*Para dúvidas técnicas: consultar docker-compose.yml e documentação oficial de cada ferramenta*
