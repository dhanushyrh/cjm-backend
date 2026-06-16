# CJM Backend

REST API for the Hiranya gold savings platform. Serves [gold-gaze-mobile-hub](../gold-gaze-mobile-hub/) (customers) and [goldkeeper-dashboard](../goldkeeper-dashboard/) (admins).

Part of the [Hiranya workspace](../README.md).

## Documentation

| Resource | Description |
|----------|-------------|
| [Wiki: cjm-backend](../wiki/projects/cjm-backend.md) | Architecture, services, extension points |
| [API contract](../wiki/architecture/api-contract.md) | All routes (authoritative) |
| [Data model](../wiki/architecture/data-model.md) | Sequelize models / Postgres tables |
| [Background jobs](../wiki/concepts/background-jobs.md) | Cron schedulers |
| [Local development](../wiki/guides/local-development.md) | Full-stack setup |
| [Known gaps](../wiki/guides/known-gaps.md) | API mismatches with frontends |

**For AI agents:** [`../wiki/index.md`](../wiki/index.md) · [`../AGENTS.md`](../AGENTS.md)

## Tech stack

- Node.js, Express 4, TypeScript
- PostgreSQL + Sequelize ORM
- JWT (separate user/admin secrets)
- AWS S3, SendGrid email
- node-cron schedulers
- Swagger at `/docs`

## Quick start

```bash
npm install
# Create .env — see README env table below
npm run dev    # http://localhost:5000
```

Swagger: http://localhost:5000/docs

## Environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Postgres |
| `JWT_SECRET` | Customer JWT |
| `ADMIN_JWT_SECRET` | Admin JWT |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` | S3 uploads |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | Email |
| `FRONTEND_URL` | Reset-password link base |

## Project structure

```
src/
├── app.ts           # Routes + schedulers
├── server.ts        # DB sync + listen
├── models/          # Sequelize schema
├── routes/          # Express routers
├── controllers/     # HTTP handlers
├── services/        # Business logic
└── schedulers/      # Cron jobs
```

## API route groups

| Prefix | Domain |
|--------|--------|
| `/api/auth` | Customer login, password |
| `/api/admin` | Admin auth, users, schemes, transactions |
| `/api/gold-prices` | Gold price CRUD + graph |
| `/api/points` | Redemption |
| `/api/user-schemes` | Enrollments |
| `/api/transactions` | Customer ledger |
| `/api/notifications` | Alerts |
| `/api/circulars` | Promotional CMS |
| `/api/referrals` | Referral leads |
| `/api/analytics` | Admin analytics |
| `/api/files` | S3 file management |
| `/api/settings` | System config |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with nodemon |
| `npm run build` | TypeScript compile |
| `npm run start:prod` | Production start |
| `npm test` | Jest tests |
| `npm run start:pm2` | PM2 process manager |

## Docker

```bash
docker compose up dev   # development
docker compose up prod  # production
```

## License

ISC
