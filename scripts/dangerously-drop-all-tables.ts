
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { db } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
  const tables = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `);

  // Handle both array and rows object format
  const tableList = Array.isArray(tables) ? tables : tables.rows || [];
  
  for (const table of tableList) {
    const tableName = table.table_name as string;
    if (tableName.startsWith("drizzle")) {
      continue;
    }
    console.log(`Dropping table: ${tableName}`);
    await db.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)} CASCADE`);
  }

  const remainingTables = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `);

  const remainingList = Array.isArray(remainingTables) ? remainingTables : remainingTables.rows || [];
  console.log('Remaining tables after drop:', remainingList.map(row => row.table_name));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
