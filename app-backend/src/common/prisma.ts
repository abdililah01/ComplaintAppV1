import { PrismaClient, Prisma } from '@prisma/client';

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['error']
    : ['query', 'info', 'warn', 'error'];

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma__ ??
  new PrismaClient({
    log: logLevels,
  });

if (!global.__prisma__) {
  global.__prisma__ = prisma;

  // Use Node's process event to avoid TS overload issues with prisma.$on('beforeExit')
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log('[prisma] disconnected');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[prisma] disconnect error', e);
    }
  });

  // Optional: connect early — fail fast if DATABASE_URL is wrong
  prisma
    .$connect()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('[prisma] connected');
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[prisma] connect error', e);
    });
}

export default prisma;
