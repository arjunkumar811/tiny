# Personal Finance Transaction Extractor

A production-realistic finance tracker with proper authentication, authorization, multi-tenancy, and data isolation.

## Tech Stack

- **Backend**: Hono + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth (with JWT)
- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel (frontend) + Railway/Render/Fly.io (backend + DB)

## Project Structure

```
finance-tracker/
├── backend/          # Hono API server
├── frontend/         # Next.js 15 app
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- pnpm, npm, or yarn package manager

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3001"
PORT=3001
```

Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start the backend server:

```bash
npm run dev
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

Start the frontend:

```bash
npm run dev
```

### Step 3: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Features

- ✅ User authentication & authorization
- ✅ Multi-tenancy with data isolation
- ✅ Transaction management (CRUD)
- ✅ Category management
- ✅ Secure user-scoped data access
- ✅ JWT-based API authentication

## Development

### Backend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio
```

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## Security Features

- Row-level security via Prisma filters
- JWT token validation on all protected routes
- Better Auth for secure session management
- Tenant isolation at database query level
- CORS configuration for API security
