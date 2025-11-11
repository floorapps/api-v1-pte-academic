// Test auth functionality
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('Testing auth configuration...');

// Test Better Auth environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const requiredEnvVars = [
  databaseUrl ? 'DATABASE_URL or POSTGRES_URL' : null,
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_BETTER_AUTH_URL',
].filter(Boolean);

const missingEnvVars = [];
if (!databaseUrl) {
  missingEnvVars.push('DATABASE_URL or POSTGRES_URL');
}
if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
  missingEnvVars.push('BETTER_AUTH_SECRET or AUTH_SECRET');
}
if (!process.env.BETTER_AUTH_URL && !process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
  missingEnvVars.push('BETTER_AUTH_URL or NEXT_PUBLIC_BETTER_AUTH_URL');
}

if (missingEnvVars.length === 0) {
  console.log('✅ All required environment variables are set');
  console.log('   Database:', databaseUrl ? '✅' : '❌');
  console.log('   Auth Secret:', (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET) ? '✅' : '❌');
  console.log('   Auth URL:', (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ? '✅' : '❌');
} else {
  console.log('❌ Missing environment variables:', missingEnvVars);
}

console.log('\n🎉 Auth setup completed successfully!');