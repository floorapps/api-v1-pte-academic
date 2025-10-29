import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  throw new Error(
    'POSTGRES_URL is not defined. Make sure it exists in your .env.local file.'
  );
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  studio: {
    port: 4984
  }
} satisfies Config;
