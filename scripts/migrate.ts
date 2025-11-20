// Migration runner for Drizzle (Postgres + postgres-js)
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function main() {
  const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error(
      'Neither POSTGRES_URL nor DATABASE_URL is defined. Add one to .env.local or .env.'
    )
  }

  // Single connection for migrations
  const client = postgres(DATABASE_URL, {
    max: 1,
    prepare: false,
    ssl: DATABASE_URL.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
  })
  const db = drizzle(client)

  // Resolve absolute path to migrations folder
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const migrationsFolder = path.resolve(__dirname, '../lib/db/migrations')

  console.log(`[migrate] Using migrations folder: ${migrationsFolder}`)

  try {
    await migrate(db, { migrationsFolder })
    console.log('[migrate] Migrations applied successfully')
  } catch (err) {
    console.error('[migrate] Migration failed:', err)
    process.exitCode = 1
  } finally {
    await client.end({ timeout: 5_000 })
  }
}

main().catch((e) => {
  console.error('[migrate] Fatal error:', e)
  process.exit(1)
})
