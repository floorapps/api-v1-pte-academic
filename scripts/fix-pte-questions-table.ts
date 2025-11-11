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
  console.log('Altering pte_questions table to fix primary key...');
  try {
    // First, check the current state of the table
    console.log('Checking current table structure...');
    
    // Alter the table to make the id column auto-incrementing
    await db.execute(sql`ALTER TABLE pte_questions DROP CONSTRAINT pte_questions_pkey;`);
    console.log('Dropped primary key constraint');
    
    await db.execute(sql`ALTER TABLE pte_questions ALTER COLUMN id DROP DEFAULT;`);
    console.log('Removed default from id column');
    
    await db.execute(sql`ALTER TABLE pte_questions ALTER COLUMN id DROP NOT NULL;`);
    console.log('Made id column nullable temporarily');
    
    await db.execute(sql`CREATE SEQUENCE pte_questions_id_seq OWNED BY pte_questions.id;`);
    console.log('Created sequence for auto-increment');
    
    await db.execute(sql`ALTER TABLE pte_questions ALTER COLUMN id SET DEFAULT nextval('pte_questions_id_seq');`);
    console.log('Set default value to use sequence');
    
    await db.execute(sql`ALTER TABLE pte_questions ALTER COLUMN id SET NOT NULL;`);
    console.log('Made id column not null again');
    
    await db.execute(sql`ALTER TABLE pte_questions ADD CONSTRAINT pte_questions_pkey PRIMARY KEY (id);`);
    console.log('Added primary key constraint back');
    
    console.log('Successfully modified pte_questions table!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();