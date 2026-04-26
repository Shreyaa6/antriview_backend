# AntriView Backend (PostgreSQL)

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Start PostgreSQL locally (example with Docker):

```bash
docker run --name antriview-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=antriview -p 5432:5432 -d postgres:16
```

3. Install and run:

```bash
npm install
npm run dev
```

The server auto-applies `src/db/schema.sql` on startup.

## API

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/users/me`
- `POST /api/sessions`
# antriview_backend
