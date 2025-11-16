import { config } from 'dotenv'
import type { Config } from 'drizzle-kit'

// Load env from .env.local then fallback to .env
config({ path: '.env.local' })
config()

const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error(
    'Neither POSTGRES_URL nor DATABASE_URL is defined. Add one to .env.local or .env.'
  )
}

export default {
  schema: ['./lib/db/schema.ts', './lib/db/schema-mock-tests.ts'],
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  migrations: {
    // Configure migrations settings here if needed
    // For available options, refer to the Drizzle documentation: https://orm.drizzle.team/kit-docs/migrations
  },
  // Removed invalid 'studio' property that was causing TypeScript error
} satisfies Config
