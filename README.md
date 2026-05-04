# Borsibaar

Full-stack bar management web application.

## Features Overview

### Bar Staff

- Manage staff user accounts
- Manage bar stations
- Manage inventory
- View and process incoming orders
- Use worker promo and games sections, which currently mix rough management screens and placeholder/demo content

### Customer

- Browse drinks and prices
- Use table-specific client menu pages
- Place customer orders through the public/table flow
- Try demo customer login, age-verification, checkout, and parts of the order-status experience

## Tech Stack

- Backend: Spring Boot 3.5.5, Java 21, Maven, Spring Security, OAuth2, JWT
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Radix UI
- Database: PostgreSQL 17, Liquibase
- API contract: OpenAPI Generator
- Realtime: Spring WebSocket for order-status updates
- Deployment assets: Docker Compose, Nginx, Helm charts

## Repository Structure

```text
backend/                  Spring Boot API, business logic, persistence, and tests
frontend/                 Next.js app, proxy routes, UI, and generated TypeScript client
nginx/                    Reverse proxy configuration for production deployment
helm/                     Helm charts for app, config, and Rancher deployment
docker-compose.yaml       Local development stack
docker-compose.prod.yaml  Production-oriented compose stack
.sample.env               Draft environment variable template
.github/                  GitHub workflows and repository metadata
```

## Main User Flows

### Worker flows

- `/worker/login` for authentication
- `/worker/onboarding` for initial account setup
- `/worker/dashboard` for organization info and sales stats
- `/worker/inventory` for products, categories, stock changes, and history
- `/worker/pos` for station selection and station administration
- `/worker/orders` for order processing
- `/worker/promo` for promotion management screens
- `/worker/games` for the games section
- `/worker/games/stock-market-bar` for the live TV pricing dashboard

### Client/public flows

- `/` opens a table/client view using the hardcoded default table code `Baar`
- `/menu` provides a public menu page using the hardcoded default table code `Baar`
- `/c/[tableCode]` and `/c/[tableCode]/menu` support table-specific client flows

## Architecture

### Backend

The backend follows a layered Spring structure:

- `entity/` for JPA models
- `repository/` for persistence
- `service/` for business logic
- `delegate/` for application-specific implementations of generated OpenAPI interfaces
- `mapper/` for MapStruct mapping
- `config/` for security, WebSocket, scheduling, and environment config
- `jobs/` for scheduled jobs such as price correction
- `ws/` for order-status WebSocket handling

The backend API contract is defined using OpenAPI in:

- `backend/src/main/resources/api-spec.yaml`

Maven uses that spec to generate Spring API interfaces, and the classes in `delegate/` provide the application-specific implementations behind those generated interfaces.

### Frontend

The frontend uses the Next.js App Router with route groups:

- `frontend/app/(worker)` for authenticated worker flows
- `frontend/app/(client)` for client/table flows
- `frontend/app/(public)` for public pages
- `frontend/app/api/backend` as a proxy layer to the backend
- `frontend/app/generated` for OpenAPI-generated TypeScript client code

The frontend has its own OpenAPI generator input at `frontend/api-spec.yaml`. This is separate from the backend spec rather than a direct shared file. Running `npm run generate` uses that frontend-side spec to regenerate `frontend/app/generated`.

In practice, the frontend currently uses the generated output mainly for TypeScript models and shared request/response shapes. Many actual HTTP calls are still written manually with `fetch`, either through `frontend/app/api/backend` proxy routes or direct server-side calls to the backend, so the generated frontend client is not the only integration path.

Because of that split, the backend spec is the fuller source of truth for the API surface, while the frontend spec is a narrower duplicated contract used for frontend code generation and may drift if it is not updated alongside backend API changes.

Middleware sits in front of all `/worker/*` routes. It checks the current session by calling the backend account endpoint with the incoming cookies, redirects unauthenticated users to `/worker/login`, sends already signed-in users away from the login page to either onboarding or the dashboard, and redirects users away from `/worker/onboarding` once setup is complete. The worker area is protected, but onboarding enforcement is not fully consistent across every worker route and should not be over-documented as stricter than the current code actually is.

### Current Auth Model

- Worker UI uses Google OAuth login plus backend session/cookie handling
- Frontend middleware protects `/worker/*` routes and redirects unauthenticated users to `/worker/login`
- Onboarding enforcement currently only checks some worker paths rather than every worker route
- Public/client flows are intentionally more open: inventory/category reads, order creation, order reads, session lookups, and order-status WebSocket access are allowed without worker authentication
- Debug auto-login exists for local development and should be treated as a development-only shortcut, not a real authentication mode

## Quick Start

### Option 1: Run the full local stack with Docker

1. Create a root `.env` file.
2. Fill in the required environment variables.
3. Start the stack:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Backend on `localhost:8080`
- Frontend on `localhost:3000`

### Option 2: Run backend and frontend manually

Start the database with Docker:

```bash
docker compose up postgres
```

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

A starter `.sample.env` file is committed in the repository, but it is incomplete and should be treated as a draft template rather than a canonical source of truth. Create `.env` at the project root and fill in the values required for your chosen run mode.

### Required in root `.env` for backend

```env
POSTGRES_DB=borsibaar
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/borsibaar
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=generate-a-long-random-secret

APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
APP_FRONTEND_URL=http://localhost:3000
OAUTH2_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
```

### Local development and debug extras

```env
SPRING_PROFILES_ACTIVE=local

DEBUG_AUTO_LOGIN=false
DEBUG_EMAIL=debug@example.com
DEBUG_NAME=Debug User
```

Notes:

- `.sample.env` is currently missing some variables used by the app, especially `APP_CORS_ALLOWED_ORIGINS`, `APP_FRONTEND_URL`, and `OAUTH2_REDIRECT_URI`
- In Docker development, compose maps `DEBUG_AUTO_LOGIN`, `DEBUG_EMAIL`, and `DEBUG_NAME` into the backend runtime variables `DEBUG_AUTO_LOGIN_ENABLED`, `DEBUG_AUTO_LOGIN_EMAIL`, and `DEBUG_AUTO_LOGIN_NAME`
- `SPRING_PROFILES_ACTIVE=local` enables the local profile and is the profile expected for debug auto-login behavior

### Provided by local Docker Compose

- `SPRING_DATASOURCE_URL` is overridden in `docker-compose.yaml` to point at the `postgres` container
- `BACKEND_URL` is set in the frontend container to `http://backend:8080`
- `NEXT_PUBLIC_BACKEND_URL` is passed as a build arg for browser-side flows such as OAuth redirects

### Frontend and proxy-related variables

- `BACKEND_URL`
  Server-side frontend URL for calling the backend inside Docker. In local compose this is set to `http://backend:8080`.
- `NEXT_PUBLIC_BACKEND_URL`
  Public backend URL used by browser-side flows such as OAuth redirects.
- `NEXT_PUBLIC_DEBUG_AUTO_LOGIN`
  Enables the frontend side of debug auto login behavior.

## Development Commands

### Backend

```bash
cd backend
./mvnw spring-boot:run
./mvnw clean package
./mvnw test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm start
npm run lint
```

### Generate frontend API client

```bash
cd frontend
npm run generate
```

This uses `frontend/api-spec.yaml` and writes generated code to `frontend/app/generated`.

Note that this generation step is separate from the backend Maven generation step, which uses `backend/src/main/resources/api-spec.yaml` to produce Spring interfaces for the backend implementation.

## Testing

Backend tests are present under `backend/src/test/java` and cover service and API delegate flows.

Run them with:

```bash
cd backend
./mvnw test
```

The frontend has linting configured, but the production build currently ignores TypeScript build errors in `frontend/next.config.ts`. Treat `npm run build` as a packaging check, not as a strict type-check or type-safety gate.

There is no separate strict frontend type-check command currently documented in the repository scripts.

## Deployment

Production-oriented assets are included in the repository:

- `docker-compose.prod.yaml` for a production compose stack
- `nginx/` for reverse proxy configuration
- `helm/` for Kubernetes/Helm deployment assets

The production compose stack adds:

- Nginx in front of frontend and backend
- public URL configuration through environment variables

## Order Sessions and Status Updates

- Creating an order generates a session identifier and sets a `session_<id>` cookie
- Order state updates can be pushed through the backend WebSocket endpoint at `/ws/order-status`
- The current implementation supports customer-facing order tracking, but the surrounding UX is still partly demo/prototype-level on the frontend

## Notes and Known Gaps

- `frontend/README.md` is still the default Next.js boilerplate and does not describe this project.
- The worker promo area has navigation shells and management-style screens, but it is not documented or validated as production-ready feature-complete functionality.
- The worker games area mixes one real pricing-board view with mock/demo game screens.
- Some UI text and labels still contain encoding issues and should be normalized to UTF-8.
- The public `/` and `/menu` routes currently hardcode the table code `Baar` instead of deriving it dynamically.
- The client pricing/menu flow currently contains hardcoded organization behavior and should be documented or made configurable before public rollout.
- The customer flow contains demo implementations for Smart-ID, customer login/account creation, and checkout/payment UX.
- WebSocket allowed origins for `/ws/order-status` are currently hardcoded and should be reviewed before wider deployment.

## Current Status

Implemented:

- Google OAuth login for workers
- Worker onboarding and protected routes
- Organization dashboard with sales statistics
- Inventory and category management
- Product creation and stock transactions
- POS station management and sales flow
- Customer order queue for workers
- Public/client live pricing and menu pages
- Backend order session handling and order-status WebSocket support
- OpenAPI-based frontend client generation

Partially implemented or rough around the edges:

- Worker route onboarding enforcement is present but not consistently applied across every worker route
- Frontend production builds ignore TypeScript build errors
- Some UI text still contains encoding issues
- Frontend and backend API specs are split and can drift if not maintained together
- Default public routes use a hardcoded table code
- WebSocket allowed origins are hardcoded
- `.sample.env` needs cleanup and adopt it as the canonical template. This should become the single source of truth for local setup and list all required variables with safe placeholder values and short comments. Right now the README documents variables that `.sample.env` does not contain, which makes setup drift easy.

Prototype or placeholder:

- Parts of promo management
- Demo game screens outside the pricing-board view
- Customer-side login/account flow
- Customer-side age verification flow
- Customer-side checkout/payment flow
- Parts of the customer-side live order status experience
