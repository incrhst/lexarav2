# IP Management System - Local Development Setup Guide

## Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git
- Docker Desktop
- Supabase CLI

## Setup Steps

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Verify installation
supabase -v
```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd ip-management-system
```

### 3. Initialize Supabase Project

```bash
# Initialize Supabase
supabase init

# Start local Supabase instance
supabase start

# This will output your local credentials, save them!
```

### 4. Configure Environment

Create a `.env` file in the project root:
```bash
# Use the credentials from `supabase start` output
VITE_SUPABASE_URL=http://localhost:54321  # Local Supabase URL
VITE_SUPABASE_ANON_KEY=your-local-anon-key  # Local anon key
VITE_DEMO_MODE=true
```

### 5. Run Migrations

```bash
# Link to your local instance (use credentials from `supabase start`)
supabase link --project-ref local

# Run migrations
supabase migration up
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Demo Accounts

The following demo accounts are available when demo mode is enabled:

| Email | Password | Role |
|-------|----------|------|
| demo.user@example.com | Demo123!@# | User |
| demo.admin@example.com | Demo123!@# | Admin |
| demo.processor@example.com | Demo123!@# | Processor |
| demo.agent@example.com | Demo123!@# | Agent |

## Troubleshooting

### Migration Issues

If you encounter database connection issues:

1. Verify Docker is running and Supabase containers are up:
```bash
docker ps | grep supabase
```

2. Check Supabase status:
```bash
supabase status
```

3. If needed, restart Supabase:
```bash
supabase stop
supabase start
```

### Demo Login Issues

If demo login fails:

1. Verify Demo Mode:
```sql
-- Run in Supabase Studio
SELECT * FROM system_settings WHERE key = 'demo_mode';
```
Should return `{"enabled": true}`

2. Check Demo Users:
```sql
-- Run in Supabase Studio
SELECT u.email, p.role 
FROM demo.users u 
JOIN demo.profiles p ON p.id = u.id;
```

3. Reset Demo Data:
```sql
-- Run in Supabase Studio
SELECT demo.create_demo_data();
```

### Database Connection Issues

If you see "connection refused" errors:

1. Verify Supabase ports:
```bash
supabase status
```
Default ports should be:
- API: 54321
- DB: 54322
- Studio: 54323

2. Check if ports are in use:
```bash
lsof -i :54321
lsof -i :54322
```

3. If needed, stop other services using these ports or modify Supabase config.

## Development Workflow

1. Create new migration:
```bash
supabase migration new my_migration_name
```

2. Apply migrations:
```bash
supabase migration up
```

3. Reset database (if needed):
```bash
supabase db reset
```

## Accessing Supabase Studio

1. Open http://localhost:54323 in your browser
2. Use Supabase Studio to:
   - Browse database
   - Run SQL queries
   - Manage authentication
   - Monitor realtime events

## Additional Resources

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Database Migration Guide](https://supabase.com/docs/guides/cli/managing-migrations)