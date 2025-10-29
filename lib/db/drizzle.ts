import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

// Ensure env vars are available for CLI/seed scripts
// Load from .env.local first (Next.js dev), then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error(
    'POSTGRES_URL environment variable is not set. Please check your .env.local file.'
  );
}

// Create a PostgreSQL client with the connection string
export const client = postgres(process.env.POSTGRES_URL, {
  ssl: process.env.POSTGRES_URL.includes('sslmode=require') ? 'require' : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
