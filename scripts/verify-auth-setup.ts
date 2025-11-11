import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

import { db } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log('✓ Verifying Better Auth + Drizzle setup...\n');

  // Check all required tables exist
  const tables = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const tableList = Array.isArray(tables) ? tables : tables.rows || [];
  const tableNames = tableList.map(row => row.table_name);

  console.log('📋 Database Tables:');
  tableNames.forEach(name => console.log(`   - ${name}`));
  console.log('');

  // Check required Better Auth tables
  const requiredTables = ['users', 'sessions', 'accounts', 'verifications'];
  const missingTables = requiredTables.filter(t => !tableNames.includes(t));

  if (missingTables.length === 0) {
    console.log('✅ All Better Auth tables present!');
    console.log('   ✓ users');
    console.log('   ✓ sessions');
    console.log('   ✓ accounts');
    console.log('   ✓ verifications');
  } else {
    console.log('❌ Missing tables:', missingTables.join(', '));
    process.exit(1);
  }

  // Check custom tables
  if (tableNames.includes('organizations')) {
    console.log('   ✓ organizations (custom table)');
  }

  console.log('\n✅ Database setup verification complete!');
  console.log('🚀 Your Better Auth + Drizzle + Neon DB setup is ready!\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error verifying setup:', err);
  process.exit(1);
});