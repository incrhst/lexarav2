# IP Management System - Remote Setup Guide

## Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- Git
- Supabase account (https://supabase.com)

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: Choose a project name
   - Database Password: Set a secure password
   - Region: Choose nearest region
4. Click "Create new project"

### 2. Get Project Credentials

1. In your Supabase project dashboard:
2. Go to Project Settings > API
3. Copy these values:
   - Project URL
   - `anon` public API key

### 3. Clone and Configure Project

```bash
# Clone repository
git clone <repository-url>
cd ip-management-system

# Create .env file
echo "VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEMO_MODE=true" > .env
```

### 4. Run Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link project:
```bash
supabase link --project-ref your-project-ref
```
(Find project ref in Project Settings > General)

4. Run migrations:
```bash
supabase migration up
```

### 5. Install Dependencies and Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Demo Accounts

When demo mode is enabled, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| demo.user@example.com | Demo123!@# | User |
| demo.admin@example.com | Demo123!@# | Admin |
| demo.processor@example.com | Demo123!@# | Processor |
| demo.agent@example.com | Demo123!@# | Agent |

## Troubleshooting

### Migration Issues

If migrations fail:

1. Check project reference:
```bash
supabase projects list
```

2. Verify connection:
```bash
supabase db ping
```

3. Check migration status:
```bash
supabase migration list
```

### Demo Login Issues

If demo login fails:

1. Verify demo mode in Supabase Dashboard:
   - Go to SQL Editor
   - Run:
   ```sql
   SELECT * FROM system_settings WHERE key = 'demo_mode';
   ```
   Should return `{"enabled": true}`

2. Reset demo data:
   ```sql
   SELECT demo.create_demo_data();
   ```

### Connection Issues

If you see connection errors:

1. Verify environment variables match Supabase dashboard values
2. Check if project is active in Supabase dashboard
3. Verify your IP is not blocked in Project Settings > API Settings

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Guide](https://supabase.com/docs/reference/cli)
- [Database Migration Guide](https://supabase.com/docs/guides/cli/managing-migrations)