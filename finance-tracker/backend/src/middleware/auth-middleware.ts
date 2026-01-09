import { Context, Next } from 'hono';
import { prisma } from '../lib/prisma';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  if (session.expiresAt < new Date()) {
    return c.json({ error: 'Token expired' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session);

  await next();
}

export async function getOrganizationFromContext(c: Context): Promise<string | null> {
  const user = c.get('user');
  
  if (!user) {
    return null;
  }

  const orgHeader = c.req.header('x-organization-id');
  
  if (orgHeader) {
    return orgHeader;
  }

  return null;
}
