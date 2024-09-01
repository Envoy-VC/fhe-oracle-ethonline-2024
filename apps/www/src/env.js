import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PRIVATE_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_WALLETCONNECT_ID: z.string().min(1),
    NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_LOCALFHENIX_CONSUMER_ADDRESS: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_WALLETCONNECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
    NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS:
      process.env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS,
    NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS:
      process.env.NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS,
    NEXT_PUBLIC_LOCALFHENIX_CONSUMER_ADDRESS:
      process.env.NEXT_PUBLIC_LOCALFHENIX_CONSUMER_ADDRESS,
  },
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
  emptyStringAsUndefined: true,
});
