import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from '../lib/db/drizzle';

async function main() {
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('Migrations applied successfully!');
    await client.end();
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main();