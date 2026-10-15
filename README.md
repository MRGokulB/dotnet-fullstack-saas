# NexusCore .NET - Enterprise SaaS Architecture Showcase

Production-grade fullstack SaaS platform built with modern .NET 7/8 Clean Architecture, Entity Framework Core, Stripe payment checkout, and a high-performance React dashboard.

## Architecture

```
DotnetFullstackSaaS/
├── src/
│   ├── DotnetFullstackSaaS.Domain/         # Domain entities, Enums (0 external dependencies)
│   ├── DotnetFullstackSaaS.Application/    # CQRS/Use cases, DTOs, FluentValidation, Interfaces
│   ├── DotnetFullstackSaaS.Infrastructure/ # EF Core, DbContext, Stripe.net Payment Engine
│   └── DotnetFullstackSaaS.WebApi/         # Kestrel server, Controllers, RFC 7807 Middleware
├── client/                                 # Vite + React 18 + Tailwind CSS Dashboard
├── Dockerfile                              # Multi-stage production container build
└── docker-compose.yml                      # Full-stack local orchestration (Postgres + API)
```

## Quick Start (Zero Config Local Run)

### 1. Run the .NET Web API
```bash
cd src/DotnetFullstackSaaS.WebApi
dotnet run
```
The API starts on `http://localhost:5000` with Swagger available at `http://localhost:5000/swagger`.
The default configuration uses SQLite (`app.db`) created automatically on first launch.

### 2. Run the React Client
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

## Stripe Payment Configuration

Update `src/DotnetFullstackSaaS.WebApi/appsettings.json` or pass environment variables:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_your_secret_key",
    "PublishableKey": "pk_test_your_publishable_key",
    "WebhookSecret": "whsec_your_webhook_secret"
  }
}
```

To test webhooks locally using Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## Free Tier Cloud Deployment ($0)

### Backend (Azure Container Apps)
1. Push your repository to GitHub.
2. Build and push your container to GitHub Container Registry (`ghcr.io`).
3. Deploy to Azure Container Apps (180,000 vCPU-seconds and 360,000 GiB-seconds free per month).
4. Set environment variable `DatabaseProvider=PostgreSql` and connect to a free tier database (Azure SQL free tier or Neon Serverless Postgres).

### Frontend (Cloudflare Pages / Vercel)
1. Link the `/client` directory to Cloudflare Pages or Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable `VITE_API_BASE_URL` pointing to your deployed Azure Container App URL.
