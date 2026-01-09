import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth-middleware';
import { prisma } from '../lib/prisma';
import { parseTransactionText } from '../utils/transaction-parser';

type Variables = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  session: any;
};

const transactionRoutes = new Hono<{ Variables: Variables }>();

const extractSchema = z.object({
  text: z.string().min(1),
});

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional(),
});

transactionRoutes.post('/extract', authMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = extractSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const { text } = parsed.data;
  const user = c.get('user');
  
  const organizationId = c.req.header('x-organization-id');

  if (!organizationId) {
    return c.json({ error: 'Organization ID required' }, 400);
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
  });

  if (!member) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const parsedTransactions = parseTransactionText(text);

  if (parsedTransactions.length === 0) {
    return c.json({ 
      error: 'No transactions found in text',
      transactions: [],
    }, 400);
  }

  const savedTransactions = await Promise.all(
    parsedTransactions.map(async (tx) => {
      return prisma.transaction.create({
        data: {
          amount: tx.amount,
          description: tx.description,
          type: tx.type,
          date: tx.date,
          confidence: tx.confidence,
          rawText: text,
          userId: user.id,
          organizationId,
        },
      });
    })
  );

  return c.json({
    success: true,
    count: savedTransactions.length,
    transactions: savedTransactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      type: tx.type,
      date: tx.date,
      confidence: tx.confidence,
      createdAt: tx.createdAt,
    })),
  });
});

transactionRoutes.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const query = c.req.query();
  const parsed = listQuerySchema.safeParse(query);

  if (!parsed.success) {
    return c.json({ error: 'Invalid query parameters' }, 400);
  }

  const { cursor, limit = '20' } = parsed.data;
  
  const organizationId = c.req.header('x-organization-id');

  if (!organizationId) {
    return c.json({ error: 'Organization ID required' }, 400);
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
  });

  if (!member) {
    return c.json({ error: 'Not a member of this organization' }, 403);
  }

  const limitNum = Math.min(parseInt(limit), 100);

  const whereClause: any = {
    organizationId,
    userId: user.id,
  };

  if (cursor) {
    whereClause.id = {
      lt: cursor,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    take: limitNum + 1,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
    },
  });

  const hasMore = transactions.length > limitNum;
  const items = hasMore ? transactions.slice(0, -1) : transactions;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return c.json({
    transactions: items.map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      description: tx.description,
      type: tx.type,
      date: tx.date,
      confidence: tx.confidence,
      category: tx.category,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    })),
    nextCursor,
    hasMore,
  });
});

export default transactionRoutes;
