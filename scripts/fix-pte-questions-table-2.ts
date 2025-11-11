import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use DATABASE_URL (standard) or fallback to POSTGRES_URL for compatibility
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

(async () => {
  console.log('Altering pte_questions table to add auto-increment...');
  try {
    // Check if the sequence already exists
    const result = await db.execute(sql`SELECT column_default FROM information_schema.columns WHERE table_name = 'pte_questions' AND column_name = 'id';`);
    console.log('Current column default:', result.rows);
    
    // The best approach is to recreate the table with the proper serial type
    // But first, let's try to fix the existing one by setting a sequence
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS pte_questions_id_seq;`);
    console.log('Created sequence if not exists');
    
    // Set the sequence to the max current value
    await db.execute(sql`SELECT setval('pte_questions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pte_questions));`);
    console.log('Set sequence to max current value');
    
    // Update the column to use the sequence as default
    await db.execute(sql`ALTER TABLE pte_questions ALTER COLUMN id SET DEFAULT nextval('pte_questions_id_seq');`);
    console.log('Set default value for id to use sequence');
    
    console.log('Successfully modified pte_questions table to auto-increment!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();