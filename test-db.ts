import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load from .env.local
config({ path: '.env.local' });

// Use DATABASE_URL (standard) or fallback to POSTGRES_URL for compatibility
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('DATABASE_URL or POSTGRES_URL environment variable is not set in .env.local');
  process.exit(1);
}

console.log('Testing database connection...');

const client = postgres(connectionString, {
  max: 1,
  ssl: connectionString.includes('sslmode=require') ? 'require' : false,
});
const db = drizzle(client);

async function testConnection() {
  try {
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // List existing tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\nExisting tables:');
    if (tables.length === 0) {
      console.log('  No tables found. Run migrations to create tables.');
    } else {
      tables.forEach((t) => console.log(`  - ${t.table_name}`));
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
