# Backend API Documentation

## Features Implemented

✅ Hono framework for high-performance API  
✅ Better Auth integration with email/password authentication  
✅ Multi-tenancy with organization-based data isolation  
✅ Session management with 7-day expiry  
✅ Transaction text parsing with confidence scoring  
✅ Cursor-based pagination for efficient data retrieval  
✅ PostgreSQL with Prisma ORM  
✅ Proper indexes on userId, organizationId, createdAt, and date  
✅ bcrypt password hashing  
✅ JWT/session token authentication  

## Environment Setup

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"
BETTER_AUTH_SECRET="your-super-secret-key-change-in-production"
PORT=3001
```

## Database Setup

1. Make sure PostgreSQL is running
2. Run migrations:
```bash
npm run prisma:migrate
```

3. (Optional) Open Prisma Studio:
```bash
npm run prisma:studio
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register
**POST** `/api/auth/register`

**Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "organization": {
    "id": "cuid...",
    "name": "John Doe's Organization",
    "slug": "org-cuid..."
  },
  "token": "session-token-here"
}
```

**Features**:
- Hashes password with bcrypt
- Automatically creates user organization
- Returns 7-day session token
- Sets user as organization owner

#### Login
**POST** `/api/auth/login`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: Same as register

**Features**:
- Validates credentials
- Creates new session with 7-day expiry
- Returns user's organization info

### Transactions (Protected Routes)

**Required Headers**:
- `Authorization: Bearer <token>`
- `x-organization-id: <organization_id>`

#### Extract Transaction from Text
**POST** `/api/transactions/extract`

**Body**:
```json
{
  "text": "01/15/2024 Grocery Store $45.99 debit\n01/16/2024 Salary deposit $2500.00 credit"
}
```

**Response**:
```json
{
  "success": true,
  "count": 2,
  "transactions": [
    {
      "id": "cuid...",
      "amount": 45.99,
      "description": "Grocery Store",
      "type": "expense",
      "date": "2024-01-15T00:00:00.000Z",
      "confidence": 0.9,
      "createdAt": "2024-01-09T..."
    },
    {
      "id": "cuid...",
      "amount": 2500.00,
      "description": "Salary deposit",
      "type": "income",
      "date": "2024-01-16T00:00:00.000Z",
      "confidence": 0.95,
      "createdAt": "2024-01-09T..."
    }
  ]
}
```

**Features**:
- Parses bank statement text
- Extracts amount, date, description, type
- Calculates confidence score
- Saves to PostgreSQL scoped to user's organization
- Returns structured data

#### List Transactions (Cursor-based Pagination)
**GET** `/api/transactions?cursor=<transaction_id>&limit=20`

**Query Parameters**:
- `cursor` (optional): Transaction ID to start from
- `limit` (optional): Max 100, default 20

**Response**:
```json
{
  "transactions": [...],
  "nextCursor": "cuid..." or null,
  "hasMore": true
}
```

**Features**:
- Cursor-based pagination for efficient loading
- Returns only user's transactions
- Enforces organization-level isolation
- Ordered by createdAt desc
- Includes category information

## Data Isolation & Security

**Multi-Tenancy**:
- Each user belongs to one or more organizations
- All queries filter by both `userId` AND `organizationId`
- Membership verified before every operation
- Role-based access control ready

**Indexes** (Performance):
- `userId, createdAt` (composite)
- `organizationId, createdAt` (composite)
- `date`
- `organizationId`
- `userId`

**Authentication**:
- Passwords hashed with bcrypt (10 rounds)
- Session tokens are UUIDs
- 7-day session expiry
- Token validation on every protected route
- Bearer token authentication

## Architecture

**Backend Stack**:
- Hono (lightweight, fast web framework)
- Better Auth (authentication with organization plugin)
- Prisma ORM (type-safe database access)
- PostgreSQL (relational database)
- bcryptjs (password hashing)
- Zod (validation)
- TypeScript (type safety)

**Project Structure**:
```
backend/
├── prisma/
│   └── schema.prisma          # Database schema with multi-tenancy
├── src/
│   ├── index.ts               # Main server entry point
│   ├── lib/
│   │   ├── auth.ts            # Better Auth configuration
│   │   └── prisma.ts          # Prisma client
│   ├── middleware/
│   │   └── auth-middleware.ts # Authentication & authorization
│   ├── routes/
│   │   ├── auth.ts            # Register & login endpoints
│   │   └── transactions.ts    # Transaction CRUD endpoints
│   └── utils/
│       └── transaction-parser.ts # Text parsing logic
└── package.json
```
