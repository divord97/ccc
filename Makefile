.PHONY: help dev build test vet lint clean \
       docker-build docker-up docker-down docker-logs \
       migrate-up migrate-down migrate-partitions \
       web-dev web-build

# ─── Variables ───
APP_NAME   := ccc-server
GO_FILES   := $(shell find . -name '*.go' -not -path './vendor/*')
COMPOSE    := docker compose

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ───

dev: ## Run Go server locally (hot reload with air if available)
	@if command -v air > /dev/null; then air; else go run ./cmd/server; fi

build: ## Build Go binary
	CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/$(APP_NAME) ./cmd/server

test: ## Run all tests with race detection
	go test -race -count=1 ./...

vet: ## Run go vet
	go vet ./...

lint: vet ## Alias for vet (add golangci-lint if available)
	@if command -v golangci-lint > /dev/null; then golangci-lint run; fi

clean: ## Remove build artifacts
	rm -rf bin/ web/dist/

# ─── Docker ───

docker-build: ## Build all Docker images
	$(COMPOSE) build

docker-up: ## Start all services
	$(COMPOSE) up -d

docker-down: ## Stop all services
	$(COMPOSE) down

docker-logs: ## Tail logs from all services
	$(COMPOSE) logs -f

docker-restart: ## Restart API service
	$(COMPOSE) restart api

docker-ps: ## Show service status
	$(COMPOSE) ps

# ─── Database ───

migrate-up: ## Run database migrations (up)
	@echo "Applying migrations from ./migrations/"
	@if command -v migrate > /dev/null; then \
		migrate -path ./migrations -database "$$DATABASE_DSN" up; \
	else \
		echo "golang-migrate CLI not found. Using docker:"; \
		$(COMPOSE) exec mysql mysql -u root -p$$MYSQL_ROOT_PASSWORD ccc < migrations/001_initial.up.sql; \
	fi

migrate-down: ## Rollback last migration
	@if command -v migrate > /dev/null; then \
		migrate -path ./migrations -database "$$DATABASE_DSN" down 1; \
	else \
		echo "golang-migrate CLI not found."; \
	fi

migrate-partitions: ## Apply MySQL partitioning
	@echo "Applying partition SQL..."
	$(COMPOSE) exec mysql mysql -u root -p$$MYSQL_ROOT_PASSWORD ccc < deploy/mysql/partitions.sql

# ─── Frontend ───

web-dev: ## Start frontend dev server
	cd web && npm run dev

web-build: ## Build frontend for production
	cd web && npm run build

web-install: ## Install frontend dependencies
	cd web && npm ci

# ─── Full Stack ───

up: docker-up ## Start everything (alias)

down: docker-down ## Stop everything (alias)

all: build web-build ## Build both backend and frontend

# ─── Load Testing ───

k6-inbound: ## Run inbound load test
	k6 run tests/k6/inbound.js

k6-outbound: ## Run outbound load test
	k6 run tests/k6/outbound.js

k6-mixed: ## Run mixed load test
	k6 run tests/k6/mixed.js

k6-websocket: ## Run WebSocket load test
	k6 run tests/k6/websocket.js

k6-report: ## Run report query load test
	k6 run tests/k6/report-query.js
