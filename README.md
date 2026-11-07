# LMSPlatform

A modern Enterprise Learning Management System (LMS) built with **Clean Architecture**, **Domain-Driven Design (DDD)**, **CQRS**, and **Event-Driven Architecture**.

> **Status:** 🚧 In Active Development

---

## 🎯 Architecture & Design Principles

- **Clean Architecture**: Strict separation of concerns (Domain, Application, Infrastructure, WebApi/Presentation).
- **Domain-Driven Design (DDD)**: Rich Domain Entities, Value Objects, Domain Events, and Aggregate Roots.
- **CQRS (Command Query Responsibility Segregation)**: Mediated request handling using MediatR with decoupled read/write pipelines.
- **Event-Driven Outbox Pattern**: Guaranteed message delivery and reliable asynchronous domain event processing with transactional outbox.
- **Modular Monolith**: Distinct bounded contexts (Identity, Learning, Commerce, etc.) designed for independent evolution or microservice extraction.
- **Result Pattern**: Explicit, type-safe error handling and validation without throwing control-flow exceptions.

---

## 🛠️ Tech Stack

### Backend (.NET 10)

- **Language & Runtime:** C# 14 / .NET 10 SDK
- **Framework:** ASP.NET Core Web API
- **Persistence & ORM:** Entity Framework Core 10 with Microsoft SQL Server 2022
- **Caching & Sessions:** Redis 8 (Distributed Cache & Active Session Management)
- **Background Jobs & Scheduling:** Hangfire (Outbox processor & parallel worker threads)
- **Mediator & Pipelines:** MediatR (Command/Query/Notification handling with validation & logging behaviors)
- **Validation:** FluentValidation
- **Observability & Diagnostics:** OpenTelemetry with .NET Aspire Dashboard & Serilog
- **Authentication & Security:** 
  - JWT (Access Tokens + Rotating Refresh Tokens stored in secure HttpOnly cookies)
  - Google OAuth 2.0 (with account picker prompt)
  - Multi-device active session tracking & remote session revocation
  - Cryptographically secure token hashing (SHA-256)
- **Email Infrastructure:** MailKit & MimeKit, MailHog (Local SMTP Server & Web Viewer)
- **Database Tooling:** CloudBeaver (Web-based Database UI)
- **Containerization:** Docker & Docker Compose

### Frontend (Next.js 16)

- **Framework:** Next.js 16 (App Router, Server Components & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & shadcn/ui (Radix UI primitives)
- **State Management & Caching:** TanStack Query (React Query) & Zustand
- **Forms & Validation:** React Hook Form & Zod
- **Icons & Motion:** Lucide React & Tailwind Animate

---

## 📂 Domains & System Roadmap

- [x] **Identity Domain**
  - [x] User Registration & Verification Email Dispatch
  - [x] Email Verification Route & Callback
  - [x] Secure Password-based Authentication & JWT Issuance
  - [x] Google OAuth 2.0 Authentication & Account Picker
  - [x] Refresh Token Rotation & Silent Renewal
  - [x] Forgot Password & Password Reset via Asynchronous Email
  - [x] Multi-Device Active Session Management & Revocation (Single / All / Specific)
  - [x] Transactional Outbox Pattern for Reliable Event Publishing
- [ ] **School Management & RBAC**
- [ ] **Learning Domain** (Courses, Modules, Lessons, Progress Tracking)
- [ ] **Commerce Domain** (Orders, Payments, Gateways)
- [ ] **Communication Domain** (Notifications, Chat, Live Streaming)
- [ ] **Student Experience & Administration**

---

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v20+) & [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Start Infrastructure Services

Run the required supporting containers (SQL Server, Redis, MailHog, Aspire Dashboard, CloudBeaver):

```bash
cd backend
docker compose up -d
```

| Service | Port | Description |
|---|---|---|
| **SQL Server 2022** | `localhost:1433` | Database engine |
| **Redis** | `localhost:6380` | Cache & session store |
| **MailHog Web UI** | `http://localhost:8026` | Local email inbox |
| **MailHog SMTP** | `localhost:1026` | SMTP test server |
| **Aspire Dashboard** | `http://localhost:18888` | OpenTelemetry traces & logs |
| **CloudBeaver** | `http://localhost:8978` | Database management UI |

### 2. Run the Backend API

```bash
cd backend
dotnet run --project src/Bootstrappers/LMS.Api/LMS.Api.csproj --launch-profile http
```

Backend API will be accessible at: `http://localhost:4000/api`

### 3. Run the Frontend App

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend application will be accessible at: `http://localhost:3000`

---

## 📄 License

This project is developed for educational purposes and portfolio demonstration.
