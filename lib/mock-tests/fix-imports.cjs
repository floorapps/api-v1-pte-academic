const fs = require('fs');

// Fix generator file
let generator = fs.readFileSync('lib/mock-tests/generator-updated.ts', 'utf8');
generator = generator.replace(
  /import { db } from '@\/lib\/db\/drizzle'\nimport \{[\s\S]*?\} from '@\/lib\/db\/schema-mock-tests'/,
  `import { db } from '@/lib/db/drizzle'
import {
  mockTests,
  mockTestQuestions,
  type NewMockTest,
  type NewMockTestQuestion,
} from '@/lib/db/schema-mock-tests'
import {
  speakingQuestions,
  writingQuestions,
  readingQuestions,
  listeningQuestions,
} from '@/lib/db/schema'`
);
fs.writeFileSync('lib/mock-tests/generator-updated.ts', generator);

// Fix orchestrator file
let orch = fs.readFileSync('lib/mock-tests/orchestrator.ts', 'utf8');
orch = orch.replace(
  /import \{[\s\S]*?\} from '@\/lib\/db\/schema-mock-tests'/,
  `import {
  mockTests,
  mockTestQuestions,
  mockTestAttempts,
  mockTestAnswers,
  type MockTestAttempt,
  type MockTestQuestion,
} from '@/lib/db/schema-mock-tests'
import {
  speakingQuestions,
  writingQuestions,
  readingQuestions,
  listeningQuestions,
} from '@/lib/db/schema'`
);
fs.writeFileSync('lib/mock-tests/orchestrator.ts', orch);

console.log('Fixed imports!');
