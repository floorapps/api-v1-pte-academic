# Next Steps - PTE Academic Mock Test System

## 🎯 Current Status

**Foundation Complete (45%)** - All core infrastructure is in place and ready for the next phase.

✅ **Completed:**
- November 2025 PTE standards implemented
- Database schema with 4 new tables
- Migrations applied successfully
- Mock test generator ready
- Test orchestrator functional
- Build verified (in progress)

---

## 🚀 Immediate Next Steps

### 1. Generate Initial Mock Test Data (READY TO RUN)

Run the generator to create all 200 mock tests:

```bash
# Generate all 200 tests
npx tsx lib/mock-tests/generator-updated.ts generate

# Or generate just the free test first
npx tsx lib/mock-tests/generator-updated.ts generate 1
```

**Expected Output:**
- 200 mock tests created
- 50 Easy (Tests 1-50)
- 100 Medium (Tests 51-150)
- 50 Hard (Tests 151-200)
- ~11,000-12,800 total question assignments

**Time:** 10-30 minutes depending on database performance

---

## 🔧 Development Priorities

### Phase 1: Core Functionality (Week 1)

#### A. Score Aggregator (Priority: HIGH)
**File:** `lib/mock-tests/score-aggregator.ts`

**Requirements:**
- Calculate overall PTE score (0-90)
- Calculate section scores (Speaking, Writing, Reading, Listening)
- Calculate enabling skills (Grammar, Oral Fluency, Pronunciation, Spelling, Vocabulary, Written Discourse)
- Integrate with existing AI scoring for speaking/writing
- Use deterministic scoring for reading/listening

**Reference:**
- `lib/pte/scoring.ts` - Existing scoring logic
- `lib/pte/scoring-rubrics.ts` - AI prompts and weights
- `lib/pte/pte-scoring.ts` - Score structure definitions

**Implementation Steps:**
1. Create `calculateMockTestScore(attemptId)` function
2. Load all answers for the attempt
3. For speaking/writing: Use existing AI scoring if available, otherwise trigger AI scoring
4. For reading/listening: Calculate deterministic scores
5. Aggregate section scores
6. Calculate enabling skills based on question type contributions
7. Save scores to `mock_test_attempts` table

#### B. API Endpoints (Priority: HIGH)
**Directory:** `app/api/mock-tests/`

**Endpoints to Create:**
1. `POST /api/mock-tests/start/route.ts`
   - Start new mock test attempt
   - Check user access (subscription)
   - Return attempt ID and test structure

2. `GET /api/mock-tests/route.ts`
   - List available tests
   - Filter by user subscription tier
   - Show completion status

3. `GET /api/mock-tests/[id]/route.ts`
   - Get test details
   - Load questions for current attempt
   - Return session state

4. `POST /api/mock-tests/[id]/answer/route.ts`
   - Submit answer for question
   - Validate timing
   - Calculate preliminary score

5. `POST /api/mock-tests/[id]/pause/route.ts`
   - Pause test at section boundary
   - Save current state
   - Validate pause count

6. `POST /api/mock-tests/[id]/resume/route.ts`
   - Resume paused test
   - Restore state
   - Update timing

7. `POST /api/mock-tests/[id]/complete/route.ts`
   - Finalize test
   - Calculate all scores
   - Generate score report

8. `GET /api/mock-tests/attempts/[id]/route.ts`
   - Get attempt details
   - Load all answers
   - Return scores and feedback

9. `GET /api/mock-tests/history/route.ts`
   - Get user's test history
   - Filter by status/date
   - Include scores

**Implementation Pattern:**
```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { startMockTestAttempt } from '@/lib/mock-tests/orchestrator'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { mockTestId } = await request.json()

  try {
    const result = await startMockTestAttempt(session.user.id, mockTestId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

### Phase 2: UI Integration (Week 2)

#### A. Update MockTestSimulator
**File:** `components/pte/mock-test-simulator.tsx`

**Changes:**
- Replace hardcoded mock data with API calls
- Integrate real timer from timing system
- Connect answer submission to backend
- Add pause/resume UI controls
- Implement section transition screens
- Show real-time progress

#### B. Test Review Interface
**File:** `app/pte/mock-tests/[id]/review/page.tsx`

**Features:**
- PTE-authentic score report layout
- Overall and section scores display
- Enabling skills breakdown
- Question-by-question review
- Show correct answers
- Display AI feedback
- Performance graphs (optional)

#### C. Test Listing Page
**File:** `app/pte/mock-tests/page.tsx`

**Features:**
- Grid/list view of all 200 tests
- Filter by difficulty
- Show completion status
- Display best scores
- Free vs paid badges
- Start/Resume/Retake buttons

### Phase 3: Additional Features (Week 3)

#### A. Timer Controller
**File:** `lib/mock-tests/timer-controller.ts`

**Requirements:**
- Server-validated timing tokens
- Time drift detection
- Auto-submit on timeout
- Section timer management
- Question-specific timers

#### B. State Manager
**File:** `lib/mock-tests/state-manager.ts`

**Requirements:**
- Save/restore attempt state
- Validate state transitions
- Prevent back navigation
- Handle network interruptions
- 24-hour auto-abandon for paused tests

#### C. Access Control Integration
**Updates to:**
- `lib/subscription/tiers.ts` - Add mock test access rules
- `lib/subscription/credits.ts` - Add mock test credit deduction
- API middleware - Enforce subscription checks

---

## 📝 Testing Checklist

### Unit Tests
- [ ] Score aggregator calculations
- [ ] Timer validation logic
- [ ] State machine transitions
- [ ] Question loading accuracy

### Integration Tests
- [ ] Full test flow (start → answer → complete)
- [ ] Pause/resume functionality
- [ ] API endpoint behavior
- [ ] Score calculation accuracy

### E2E Tests
- [ ] Complete 2-hour test simulation
- [ ] Multi-section navigation
- [ ] Score report generation
- [ ] Payment/subscription flow

---

## 🎨 UI/UX Considerations

### Timer Display
- Countdown timer always visible
- Warning when < 5 minutes remaining
- Auto-submit modal before timeout

### Progress Tracking
- Question counter (e.g., "Question 15 of 62")
- Section progress bar
- Mark for review feature

### Pause Modal
- Show pause count (1/2 remaining)
- Explain section boundary restriction
- Confirm pause action

### Score Report
- Match official PTE Academic format
- Show score breakdown
- Percentile indicators
- Comparison with previous attempts

---

## 🔒 Security & Performance

### Security
- Validate all user inputs
- Prevent answer tampering
- Secure timing tokens
- Rate limiting on submissions

### Performance
- Cache test structures
- Preload next questions
- Lazy load question media
- Optimize database queries
- Use React Compiler for UI

---

## 📊 Analytics to Track

### User Metrics
- Mock test completion rate
- Average scores by section
- Most difficult question types
- Time spent per section
- Pause frequency

### System Metrics
- API response times
- Database query performance
- AI scoring latency
- Concurrent users during tests

---

## 🚢 Deployment Plan

### Pre-Deployment
1. Run all tests
2. Verify build passes
3. Check database migrations
4. Generate mock test data
5. Test on staging environment

### Deployment Steps
1. Deploy database migrations
2. Run mock test generator
3. Deploy backend code
4. Deploy frontend code
5. Monitor initial usage
6. Collect user feedback

### Post-Deployment
1. Monitor error logs
2. Track performance metrics
3. Gather user feedback
4. Plan iterations

---

## 💡 Quick Wins

These can be implemented quickly for immediate value:

1. **Generate Mock Tests** (30 mins)
   - Run generator script
   - Validate data

2. **Create Start API** (2 hours)
   - Implement POST /api/mock-tests/start
   - Basic error handling

3. **Update Test Listing** (3 hours)
   - Show available tests
   - Link to existing UI

4. **Basic Score Display** (2 hours)
   - Show overall score after completion
   - Simple UI, no fancy graphics

---

## 📚 Resources

### Documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Full implementation details
- [MOCK_TEST_IMPLEMENTATION_PROGRESS.md](MOCK_TEST_IMPLEMENTATION_PROGRESS.md) - Task tracker
- [lib/pte/scoring-nov2025-updates.md](lib/pte/scoring-nov2025-updates.md) - Scoring standards

### Code References
- [lib/mock-tests/orchestrator.ts](lib/mock-tests/orchestrator.ts) - All core functions
- [lib/mock-tests/generator-updated.ts](lib/mock-tests/generator-updated.ts) - Data generation
- [lib/db/schema-mock-tests.ts](lib/db/schema-mock-tests.ts) - Database structure

### External Resources
- [PTE Academic Official](https://www.pearsonpte.com/) - Test format reference
- [Next.js 16 Docs](https://nextjs.org/docs) - Framework reference
- [Drizzle ORM Docs](https://orm.drizzle.team/) - Database ORM

---

## 🎯 Success Criteria

The mock test system will be considered complete when:

- [x] Database schema deployed ✅
- [x] Mock test generator functional ✅
- [x] Test orchestrator operational ✅
- [ ] 200 mock tests generated
- [ ] All API endpoints working
- [ ] UI fully integrated
- [ ] Scores calculated accurately
- [ ] Subscription access enforced
- [ ] Tests passing (unit, integration, E2E)
- [ ] Deployed to production
- [ ] User feedback collected

**Current Progress: 45% Complete**
**Estimated Time to Completion: 30-40 hours**

---

## 🙋 Need Help?

If you encounter issues:

1. Check the implementation files for inline comments
2. Review the schema for data structure
3. Test the orchestrator functions in isolation
4. Verify database migrations are applied
5. Check API endpoints with curl/Postman

---

**Ready to proceed with the next phase!** 🚀

The foundation is solid. Now it's time to build the user-facing features and complete the mock test experience.
