#!/bin/bash
# Verification script for test setup

echo "=== PTE Academic Test Suite Verification ==="
echo ""

echo "✓ Checking test infrastructure..."
[ -f "jest.config.js" ] && echo "  ✅ jest.config.js" || echo "  ❌ jest.config.js missing"
[ -f "__tests__/setup.ts" ] && echo "  ✅ __tests__/setup.ts" || echo "  ❌ __tests__/setup.ts missing"
[ -f "__tests__/README.md" ] && echo "  ✅ __tests__/README.md" || echo "  ❌ __tests__/README.md missing"

echo ""
echo "✓ Checking test files..."
[ -f "__tests__/lib/utils/utils.test.ts" ] && echo "  ✅ utils.test.ts" || echo "  ❌ utils.test.ts missing"
[ -f "__tests__/lib/pte/pte-utils.test.ts" ] && echo "  ✅ pte-utils.test.ts" || echo "  ❌ pte-utils.test.ts missing"
[ -f "__tests__/lib/pte/timing.test.ts" ] && echo "  ✅ timing.test.ts" || echo "  ❌ timing.test.ts missing"
[ -f "__tests__/lib/pte/scoring-normalize.test.ts" ] && echo "  ✅ scoring-normalize.test.ts" || echo "  ❌ scoring-normalize.test.ts missing"
[ -f "__tests__/lib/pte/scoring-deterministic.test.ts" ] && echo "  ✅ scoring-deterministic.test.ts" || echo "  ❌ scoring-deterministic.test.ts missing"
[ -f "__tests__/lib/ai/credit-tracker.test.ts" ] && echo "  ✅ credit-tracker.test.ts" || echo "  ❌ credit-tracker.test.ts missing"

echo ""
echo "✓ Test statistics..."
TEST_FILES=$(find __tests__ -name "*.test.ts" | wc -l)
echo "  📊 Total test files: $TEST_FILES"

TOTAL_TESTS=$(grep -r "it(" __tests__ --include="*.test.ts" | wc -l)
echo "  📊 Approximate test cases: $TOTAL_TESTS"

TOTAL_LINES=$(find __tests__ -name "*.test.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
echo "  📊 Total lines of test code: $TOTAL_LINES"

echo ""
echo "✓ Checking documentation..."
[ -f "TEST_GENERATION_SUMMARY.md" ] && echo "  ✅ TEST_GENERATION_SUMMARY.md" || echo "  ❌ TEST_GENERATION_SUMMARY.md missing"

echo ""
echo "=== Verification Complete ==="
echo ""
echo "To run tests, execute:"
echo "  pnpm add -D ts-jest @types/jest  # Install dependencies"
echo "  pnpm test                         # Run all tests"
echo "  pnpm test:coverage                # Run with coverage"
echo ""