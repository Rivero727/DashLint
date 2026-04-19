import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true, 
    autoSignIn: false,
  },
  // trustedOrigins: ['http://localhost:3001'], // agrega otros orígenes si tu app no usa el puerto 3000
});