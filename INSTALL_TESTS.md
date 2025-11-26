# Installing and Running Tests

## Quick Start

```bash
# 1. Install test dependencies
pnpm add -D ts-jest @types/jest

# 2. Run tests
pnpm test

# 3. Run with coverage
pnpm test:coverage
```

## What Was Added

### Test Infrastructure
- ✅ `jest.config.js` - Jest configuration for TypeScript
- ✅ `__tests__/setup.ts` - Global test setup
- ✅ `__tests__/README.md` - Comprehensive test documentation
- ✅ `TEST_GENERATION_SUMMARY.md` - Summary of all tests
- ✅ `verify-tests.sh` - Verification script

### Test Files (6 files, 231 test cases, 1,786 lines)

#### Core Utilities
- ✅ `__tests__/lib/utils/utils.test.ts` - className merging utilities

#### PTE Utilities  
- ✅ `__tests__/lib/pte/pte-utils.test.ts` - Word counting, media detection
- ✅ `__tests__/lib/pte/timing.test.ts` - PTE timing calculations
- ✅ `__tests__/lib/pte/scoring-normalize.test.ts` - Score normalization
- ✅ `__tests__/lib/pte/scoring-deterministic.test.ts` - Deterministic scoring

#### AI Services
- ✅ `__tests__/lib/ai/credit-tracker.test.ts` - AI cost calculations

### Package.json Updates
Added test scripts:
- `test` - Run all tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Run tests with coverage report
- `test:ci` - Run tests in CI environment

## Test Coverage

The test suite covers:
- ✅ Pure functions and business logic
- ✅ Edge cases and boundary conditions
- ✅ Error handling
- ✅ PTE-specific calculations
- ✅ Cost calculations for AI services
- ✅ November 2025 PTE updates

## Running Tests

### All Tests
```bash
pnpm test
```

### Watch Mode (for development)
```bash
pnpm test:watch
```

### With Coverage
```bash
pnpm test:coverage
```

### Specific Test File
```bash
pnpm test timing.test.ts
```

### Specific Test Pattern
```bash
pnpm test --testNamePattern="countWords"
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:ci
```

## Test Structure

Each test file follows AAA pattern:
- **Arrange**: Set up test data
- **Act**: Execute the function
- **Assert**: Verify the result

Example:
```typescript
it('should count words correctly', () => {
  // Arrange
  const text = 'Hello world'
  
  // Act
  const result = countWords(text)
  
  // Assert
  expect(result).toBe(2)
})
```

## Troubleshooting

### If tests fail to run
1. Ensure dependencies are installed: `pnpm install`
2. Clear Jest cache: `pnpm test --clearCache`
3. Check Node version: `node --version` (requires Node 18+)

### If imports fail
- Verify path mappings in `tsconfig.json` match `jest.config.js`
- Check that all source files exist

### If server-only imports cause issues
- They should be mocked automatically in test files
- Check mock is present at top of test file

## Next Steps

1. **Install dependencies** (required):
   ```bash
   pnpm add -D ts-jest @types/jest
   ```

2. **Run tests** to verify:
   ```bash
   pnpm test
   ```

3. **View coverage**:
   ```bash
   pnpm test:coverage
   open coverage/lcov-report/index.html
   ```

4. **Add to CI/CD**: Create `.github/workflows/test.yml`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Test README](__tests__/README.md)
- [Test Summary](TEST_GENERATION_SUMMARY.md)