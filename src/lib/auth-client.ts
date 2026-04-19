import { createAuthClient } from 'better-auth/react';

// Exporta funciones y hooks listos para usar
export const { signIn, signUp, signOut, useSession } = createAuthClient();