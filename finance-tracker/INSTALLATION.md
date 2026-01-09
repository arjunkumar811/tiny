# Finance Tracker - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **pnpm** (comes with Node.js)
- **Git** (optional, for version control)

## Quick Start

### Step 1: Install PostgreSQL and Create Database

1. Install PostgreSQL from the official website
2. Start PostgreSQL service
3. Create a new database:

```bash
# On Windows (PowerShell), open PostgreSQL command prompt (psql)
psql -U postgres

# In psql prompt:
CREATE DATABASE finance_tracker;
\q
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env file and update DATABASE_URL with your PostgreSQL credentials
# Example: DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/finance_tracker"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### Step 3: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/finance_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BETTER_AUTH_SECRET="your-better-auth-secret-key-min-32-chars-long"
BETTER_AUTH_URL="http://localhost:3001"
PORT=3001
NODE_ENV="development"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
BETTER_AUTH_SECRET="your-better-auth-secret-key-min-32-chars-long"
BETTER_AUTH_URL="http://localhost:3000"
```

**Important:** Use the same `BETTER_AUTH_SECRET` value in both backend and frontend!

## Available Commands

### Backend

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

### Frontend

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Troubleshooting

### PostgreSQL Connection Issues

If you get database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # Windows - check if service is running
   Get-Service -Name postgresql*
   ```

2. Check your DATABASE_URL format:
   ```
   postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
   ```

3. Test connection:
   ```bash
   cd backend
   npm run prisma:studio
   ```

### Port Already in Use

If ports 3000 or 3001 are occupied:

- Change `PORT` in backend `.env`
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Frontend port can be changed: `npm run dev -- -p 3002`

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Verifying Installation

1. Backend health check: Visit `http://localhost:3001/api/health`
2. Frontend: Visit `http://localhost:3000`
3. Database: Run `npm run prisma:studio` in backend folder

## Next Steps

The project is now set up with:

✅ Hono backend with TypeScript
✅ PostgreSQL database with Prisma ORM  
✅ Better Auth configuration
✅ Next.js 15 frontend with App Router
✅ Tailwind CSS + shadcn/ui ready
✅ Multi-tenancy database schema

You're ready to start building features!
