#!/usr/bin/env node

/**
 * Simple test for the new AI scoring implementation
 */

const { scoreSpeakingSimple, scoreWritingSimple, scoreWithFallback } = require('../lib/ai/simple-scoring');

async function testSimpleScoring() {
  console.log('🚀 Testing Simple AI Scoring Implementation...\n');

  const testCases = [
    {
      type: 'speaking',
      transcript: "The rapid advancement of artificial intelligence has revolutionized various industries, from healthcare to finance. Machine learning algorithms can now process vast amounts of data and identify patterns that would be impossible for humans to detect manually.",
      question: "Describe how artificial intelligence is changing modern industries."
    },
    {
      type: 'writing', 
      transcript: "In recent years, artificial intelligence has emerged as a transformative force across multiple sectors. This essay will examine the profound impact of AI on modern industries and society at large.",
      question: "Discuss the impact of artificial intelligence on modern society."
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.type} scoring...`);
    console.log(`Question: ${testCase.question}`);
    console.log(`Response: ${testCase.transcript.substring(0, 100)}...`);
    
    try {
      if (testCase.type === 'speaking') {
        const result = await scoreSpeakingSimple(testCase.transcript, testCase.question);
        console.log(`✅ Speaking Score: ${result.overall}/90`);
        console.log(`   Content: ${result.content}, Pronunciation: ${result.pronunciation}, Fluency: ${result.fluency}`);
      } else {
        const result = await scoreWritingSimple(testCase.transcript, testCase.question);
        console.log(`✅ Writing Score: ${result.overall}/90`);
        console.log(`   Content: ${result.content}, Grammar: ${result.grammar}, Vocabulary: ${result.vocabulary}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }

  // Test fallback scoring
  console.log('Testing fallback scoring...');
  try {
    const result = await scoreWithFallback(
      "Artificial intelligence is transforming education by providing personalized learning experiences.",
      "How is AI changing education?",
      "speaking"
    );
    console.log(`✅ Fallback Score: ${result.overall}/90 (Provider: ${result.provider})`);
  } catch (error) {
    console.log(`❌ Fallback failed: ${error.message}`);
  }

  console.log('\n✨ Test completed!');
}

if (require.main === module) {
  testSimpleScoring().catch(console.error);
}

module.exports = { testSimpleScoring };