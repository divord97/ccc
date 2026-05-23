# CCC Platform — Deployment Guide

## Architecture Overview

```
                    ┌─────────────┐
                    │   Nginx     │ :80/:443
                    │ (Frontend)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         /api/v1      /ws/       static files
              │            │            │
              ▼            ▼            ▼
        ┌──────────────────────┐   ┌──────────┐
        │    Go API Server     │   │ React SPA │
        │       :8080          │   │  (Nginx)  │
        └──┬───┬───┬───┬───┬──┘   └──────────┘
           │   │   │   │   │
    ┌──────┘   │   │   │   └──────┐
    ▼          ▼   ▼   ▼          ▼
┌───────┐ ┌─────┐ ┌──────┐ ┌──────────┐ ┌──────┐
│ MySQL │ │Redis│ │MinIO │ │FreeSWITCH│ │ NATS │
│ :3306 │ │:6379│ │:9000 │ │:5060/8021│ │:4222 │
└───────┘ └─────┘ └──────┘ └──────────┘ └──────┘
                                │
                    ┌───────────┤
                    ▼           ▼
              ┌──────────┐ ┌──────────┐
              │Prometheus│ │ Grafana  │
              │  :9090   │ │  :3000   │
              └──────────┘ └──────────┘
```

## Quick Start (Docker Compose)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env — at minimum change JWT_SECRET and passwords

# 2. Start all services
make docker-up
# or: docker compose up -d

# 3. Apply database migrations
make migrate-up

# 4. (Optional) Apply MySQL partitions for production
make migrate-partitions

# 5. Access
# Frontend:      http://localhost
# API:           http://localhost:8080/api/v1
# Grafana:       http://localhost:3000 (admin/admin)
# MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
# Prometheus:    http://localhost:9090
# NATS Monitor:  http://localhost:8222
```

## Service Ports

| Service      | Port          | Protocol | Description                    |
|-------------|---------------|----------|--------------------------------|
| Nginx (Web)  | 80            | HTTP     | Frontend + API reverse proxy   |
| Go API       | 8080          | HTTP     | Backend REST API + WebSocket   |
| MySQL        | 3306          | TCP      | Database                       |
| Redis        | 6379          | TCP      | Cache + rate limiting          |
| MinIO        | 9000 / 9001   | HTTP     | S3 storage / Console           |
| FreeSWITCH   | 5060 (UDP/TCP)| SIP      | Voice signaling                |
| FreeSWITCH   | 5061          | TLS      | Secure SIP                     |
| FreeSWITCH   | 8021          | TCP      | ESL (Event Socket)             |
| FreeSWITCH   | 8081          | WS       | mod_verto WebSocket            |
| FreeSWITCH   | 8082          | WSS      | mod_verto Secure WebSocket     |
| NATS         | 4222 / 8222   | TCP/HTTP | Message bus / Monitor          |
| Prometheus   | 9090          | HTTP     | Metrics collection             |
| Grafana      | 3000          | HTTP     | Monitoring dashboards          |

## Environment Variables

See `.env.example` for all available variables. Critical ones:

| Variable              | Required | Description                       |
|----------------------|----------|-----------------------------------|
| `DATABASE_DSN`       | Yes      | MySQL connection string           |
| `REDIS_ADDR`         | Yes      | Redis host:port                   |
| `JWT_SECRET`         | Yes      | JWT signing key (min 32 chars)    |
| `ESL_HOST`           | Yes      | FreeSWITCH ESL host              |
| `ESL_PASSWORD`       | Yes      | FreeSWITCH ESL password          |
| `MINIO_ENDPOINT`     | Yes      | MinIO S3 endpoint                |
| `SNOWFLAKE_NODE_ID`  | Yes      | Unique per instance (1-1023)     |

## Production Deployment

### Prerequisites

- Docker 24+ with Compose v2
- 8GB+ RAM (16GB recommended for 500+ agents)
- 4+ CPU cores
- SSD storage for MySQL and MinIO

### Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Enable TLS on Nginx (add SSL cert + redirect 80→443)
- [ ] Enable TLS/SRTP on FreeSWITCH (place certs in `deploy/freeswitch/conf/certs/`)
- [ ] Restrict ESL access to internal network only
- [ ] Set up MySQL replication for HA
- [ ] Configure Redis Cluster or Sentinel for HA
- [ ] Set up MinIO distributed mode for HA
- [ ] Enable audit logging
- [ ] Review API rate limits per tenant

### TLS/SRTP Setup

```bash
# Generate self-signed certs for FreeSWITCH (production: use CA-signed)
mkdir -p deploy/freeswitch/conf/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deploy/freeswitch/conf/certs/wss.pem \
  -out deploy/freeswitch/conf/certs/wss.pem \
  -subj "/CN=ccc.example.com"

# For Nginx TLS
# Place fullchain.pem and privkey.pem in deploy/nginx/certs/
```

### MySQL Partitioning

Partitioning is recommended for tables with high write volume:

```bash
# Apply partitions (after migrations)
make migrate-partitions

# Tables partitioned by month:
# - calls, call_events, agent_presence_log
# - im_messages, audit_logs, qa_results
# - webrtc_quality_logs, annotation_results
```

Partition maintenance (run monthly via cron):
```sql
-- Add new month partition
ALTER TABLE calls REORGANIZE PARTITION p_future INTO (
    PARTITION p2027_01 VALUES LESS THAN (TO_DAYS('2027-02-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Drop partitions older than retention period
ALTER TABLE calls DROP PARTITION p2024_01;
```

### Scaling

**Multiple Go API instances:**
```bash
# Scale API to 3 instances behind a load balancer
docker compose up -d --scale api=3

# Each instance needs unique SNOWFLAKE_NODE_ID (1, 2, 3)
```

**FreeSWITCH cluster with OpenSIPS/Kamailio SIP LB:**
```
                    ┌──────────┐
    SIP ──────────► │ OpenSIPS │ ◄── SIP Load Balancer
                    │ (SIP LB) │
                    └─┬──────┬─┘
                      │      │
              ┌───────┘      └───────┐
              ▼                      ▼
        ┌──────────┐          ┌──────────┐
        │   FS #1  │          │   FS #2  │
        └──────────┘          └──────────┘
```

## Monitoring

### Grafana Dashboards

Pre-configured dashboards are auto-provisioned:

- **CCC Platform Overview**: HTTP rates, latency percentiles, active calls, ESL connections, agent status distribution, queue depths, error rates

### Custom Metrics

| Metric                          | Type      | Description                    |
|--------------------------------|-----------|--------------------------------|
| `ccc_http_requests_total`      | Counter   | Total HTTP requests            |
| `ccc_http_request_duration_seconds` | Histogram | Request latency           |
| `ccc_http_requests_in_flight`  | Gauge     | Current active requests        |
| `ccc_active_calls`             | Gauge     | Active calls                   |
| `ccc_active_agents`            | Gauge     | Agents by status               |
| `ccc_esl_connections_active`   | Gauge     | ESL connection pool size       |
| `ccc_esl_command_duration_seconds` | Histogram | ESL command latency       |
| `ccc_queue_depth`              | Gauge     | Queue depth per skill group    |
| `ccc_campaign_progress_ratio`  | Gauge     | Campaign completion ratio      |

## Load Testing

```bash
# Install k6
# macOS: brew install k6
# Linux: snap install k6

# Set auth token
export AUTH_TOKEN="your-jwt-token"

# Run individual tests
make k6-inbound     # 1000 concurrent inbound calls
make k6-outbound    # 500 concurrent outbound
make k6-mixed       # 500 inbound + 500 outbound
make k6-websocket   # 500 agents + 10 admin WS
make k6-report      # Report query performance
```

## Troubleshooting

**API won't start:**
```bash
docker compose logs api
# Common: MySQL not ready → wait for healthcheck
# Common: Bad DATABASE_DSN → check .env
```

**FreeSWITCH ESL connection refused:**
```bash
docker compose exec freeswitch fs_cli -x "status"
# Check ESL is listening on 8021
```

**High memory usage:**
```bash
# Check MySQL buffer pool
docker compose exec mysql mysql -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"

# Check Redis memory
docker compose exec redis redis-cli INFO memory
```

**Partition maintenance:**
```bash
# Check partition status
docker compose exec mysql mysql -e "
  SELECT TABLE_NAME, PARTITION_NAME, TABLE_ROWS
  FROM INFORMATION_SCHEMA.PARTITIONS
  WHERE TABLE_SCHEMA='ccc' AND PARTITION_NAME IS NOT NULL
  ORDER BY TABLE_NAME, PARTITION_NAME;"
```
