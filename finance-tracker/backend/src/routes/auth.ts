import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return c.json({ error: 'User already exists' }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: `${user.name || email}'s Organization`,
      slug: `org-${user.id}`,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    token: session.token,
  }, 201);
});

authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.errors }, 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const organization = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    organization: organization ? {
      id: organization.organization.id,
      name: organization.organization.name,
      slug: organization.organization.slug,
    } : null,
    token: session.token,
  });
});

export default authRoutes;
