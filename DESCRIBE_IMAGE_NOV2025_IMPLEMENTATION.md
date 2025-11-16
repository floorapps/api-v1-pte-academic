# Describe Image - November 2025 Implementation Guide

## Overview
This document outlines the complete architecture and November 2025 compliance updates for the Describe Image feature in the PTE Academic practice platform.

## Current Architecture (✅ Working)

### Component Flow
```
Page Component (Server)
  ↓
SpeakingQuestionClient (Client)
  ↓
┌─────────────┬──────────────┬─────────────┐
│  Question   │   Recorder   │   Results   │
│   Prompt    │              │   Display   │
└─────────────┴──────────────┴─────────────┘
```

### Key Files
1. **Page**: `app/pte/academic/practice/speaking/describe-image/question/[id]/page.tsx`
2. **Client Orchestrator**: `components/pte/speaking/SpeakingQuestionClient.tsx`
3. **Recorder**: `components/pte/speaking/SpeakingRecorder.tsx`
4. **API**: `app/api/speaking/attempts/route.ts`
5. **Scoring**: `lib/pte/speaking-score.ts`
6. **Rubrics**: `lib/pte/scoring-rubrics.ts`
7. **AI Orchestrator**: `lib/ai/orchestrator.ts`

### User Journey
1. View image (chart/graph/diagram/photo)
2. Prepare (25 seconds)
3. Record response (40 seconds max)
4. Upload audio to Vercel Blob
5. Transcribe with OpenAI Whisper
6. Score with AI (GPT-4o-mini)
7. Display scores and feedback

### Database Schema (`speakingAttempts`)
```typescript
{
  id: uuid
  userId: text
  questionId: uuid
  type: 'describe_image'
  audioUrl: text              // Vercel Blob URL
  transcript: text            // From Whisper
  scores: jsonb {
    content: number (0-90)
    pronunciation: number (0-90)
    fluency: number (0-90)
    total: number (0-90)
    rubric: { contentNotes, fluencyNotes, pronunciationNotes }
    feedback: { suggestions, strengths, areasForImprovement }
    meta: { provider, wordsPerMinute, fillerRate }
  }
  durationMs: integer
  wordsPerMinute: decimal
  fillerRate: decimal
  timings: jsonb
  createdAt: timestamp
}
```

## November 2025 Requirements

### 1. Hybrid Scoring: AI + Human Review

**Requirement**: Describe Image requires human review for content quality and template detection.

**Current Status**: ❌ Not Implemented

**Implementation Steps**:

#### A. Update Database Schema
```sql
-- Add human review columns
ALTER TABLE speaking_attempts
ADD COLUMN flagged_for_human_review boolean DEFAULT false,
ADD COLUMN human_review_reason text,
ADD COLUMN template_detected boolean DEFAULT false,
ADD COLUMN template_confidence decimal(5,3),
ADD COLUMN originality_score integer,
ADD COLUMN human_reviewed_at timestamp,
ADD COLUMN human_reviewer_id text REFERENCES users(id),
ADD COLUMN human_review_notes text,
ADD COLUMN final_scores jsonb;

-- Index for review queue
CREATE INDEX idx_speaking_attempts_flagged
ON speaking_attempts(flagged_for_human_review, created_at)
WHERE flagged_for_human_review = true;
```

#### B. Template Detection Algorithm
**File**: `lib/pte/template-detection.ts`

```typescript
export interface TemplateDetectionResult {
  isTemplate: boolean
  confidence: number // 0-1
  matchedPhrases: string[]
  originalityScore: number // 0-100
  reason: string
}

export async function detectTemplate(
  transcript: string,
  questionType: string
): Promise<TemplateDetectionResult> {
  // Common template phrases for Describe Image
  const TEMPLATE_PATTERNS = [
    // Opening phrases
    /^(the|this) (given|provided|above) (image|chart|graph|diagram)/i,
    /^according to (the|this) (image|chart|graph)/i,
    /^looking at (the|this) (image|chart|graph)/i,

    // Body phrases
    /(it is (clear|evident|obvious) that)/i,
    /(from (the|this) (image|chart|graph) we can (see|observe))/i,
    /(the (image|chart|graph) (shows|displays|presents|illustrates))/i,

    // Transition phrases
    /(moreover|furthermore|in addition|additionally)/gi,
    /(on the other hand|however|conversely)/gi,

    // Closing phrases
    /(in conclusion|to (sum|summarize|conclude))/i,
    /(overall|all in all)/i,
  ]

  // Check for exact template matches
  const matchedPhrases: string[] = []
  let templateCount = 0

  for (const pattern of TEMPLATE_PATTERNS) {
    const matches = transcript.match(pattern)
    if (matches) {
      templateCount++
      matchedPhrases.push(matches[0])
    }
  }

  // Calculate template score
  const templateRatio = templateCount / TEMPLATE_PATTERNS.length
  const confidence = Math.min(templateRatio * 2, 1) // Scale up for detection

  // Check for generic filler content
  const words = transcript.split(/\s+/)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  const lexicalDiversity = uniqueWords.size / words.length

  // Low diversity = likely templated
  const diversityPenalty = lexicalDiversity < 0.4 ? 0.3 : 0

  const finalConfidence = Math.min(confidence + diversityPenalty, 1)
  const originalityScore = Math.round((1 - finalConfidence) * 100)

  return {
    isTemplate: finalConfidence > 0.6,
    confidence: finalConfidence,
    matchedPhrases,
    originalityScore,
    reason: finalConfidence > 0.6
      ? `Response contains ${templateCount} common template phrases with low lexical diversity (${(lexicalDiversity * 100).toFixed(1)}%)`
      : 'Response appears original with good lexical variety'
  }
}
```

#### C. Enhanced AI Scoring Prompt
**File**: `lib/pte/scoring-rubrics.ts` (Update)

```typescript
export function buildDescribeImagePrompt(params: {
  transcript: string
  imageDescription?: string // From question metadata
  includeRationale?: boolean
}): PromptPair {
  const { transcript, imageDescription, includeRationale } = params

  const system = [
    'You are a certified Pearson PTE Academic examiner specializing in Describe Image tasks.',
    'November 2025 Update: Focus on content quality, originality, and accurate visual description.',
    'Score on 0-90 scale for: content, pronunciation, fluency, grammar, vocabulary.',
    'CRITICAL: Flag template usage and check for memorized responses.',
    'Return ONLY valid JSON (no markdown).',
  ].join(' ')

  const user = [
    'Task: Describe Image',
    imageDescription ? `Image Content: ${imageDescription}` : '',
    `Candidate Response: """${transcript}"""`,
    '',
    'Scoring Criteria (November 2025):',
    '',
    'CONTENT (0-90):',
    '- 80-90: Comprehensive description of all key elements, accurate trends, specific data points',
    '- 65-79: Good coverage of main elements, some details, mostly accurate',
    '- 50-64: Basic description, missing some elements, general observations',
    '- 35-49: Incomplete, vague, or partially inaccurate',
    '- 0-34: Minimal content, irrelevant, or completely off-topic',
    '',
    'PRONUNCIATION (0-90):',
    '- Clear, intelligible, natural stress and intonation',
    '- Minimal mispronunciations',
    '',
    'FLUENCY (0-90):',
    '- Smooth, natural pace (130-160 words/minute optimal)',
    '- Minimal hesitations, no long pauses',
    '- Coherent idea flow',
    '',
    'TEMPLATE DETECTION:',
    '- Flag if response uses memorized phrases',
    '- Check for generic descriptions applicable to any image',
    '- Verify specific details match the actual image',
    '',
    'Output JSON schema:',
    '{',
    '  "overall": number,',
    '  "content": number,',
    '  "pronunciation": number,',
    '  "fluency": number,',
    '  "grammar": number,',
    '  "vocabulary": number,',
    '  "template_detected": boolean,',
    '  "template_indicators": string[],',
    '  "originality_notes": string,',
    `  "rationale": "${includeRationale ? 'string' : ''}"`,
    '}',
  ].join('\n')

  return { system, user }
}
```

#### D. Update Speaking Score Function
**File**: `lib/pte/speaking-score.ts` (Update)

```typescript
import { detectTemplate } from './template-detection'

export async function scoreDescribeImageAttempt(params: {
  question: SpeakingQuestion
  transcript: string
  audioUrl: string
  durationMs: number
}): Promise<SpeakingScore> {
  const { question, transcript, audioUrl, durationMs } = params

  // 1. Template Detection (November 2025)
  const templateResult = await detectTemplate(transcript, 'describe_image')

  // 2. Calculate basic metrics
  const words = transcript.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const durationSec = durationMs / 1000
  const wordsPerMinute = (wordCount / durationSec) * 60

  // 3. Filler detection
  const fillers = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'sort of', 'kind of']
  const fillerCount = words.filter(w =>
    fillers.includes(w.toLowerCase())
  ).length
  const fillerRate = fillerCount / wordCount

  // 4. AI Scoring with enhanced prompt
  const prompt = buildDescribeImagePrompt({
    transcript,
    imageDescription: question.promptText,
    includeRationale: true
  })

  let aiScore: any
  try {
    const response = await callAIProvider(prompt)
    aiScore = JSON.parse(response)
  } catch (error) {
    console.error('AI scoring failed:', error)
    // Fallback to heuristic
    aiScore = heuristicDescribeImageScore(wordCount, wordsPerMinute, fillerRate)
  }

  // 5. Combine AI score with template detection
  const finalScore: SpeakingScore = {
    overall: aiScore.overall,
    content: aiScore.content,
    pronunciation: aiScore.pronunciation,
    fluency: aiScore.fluency,
    grammar: aiScore.grammar || 70,
    vocabulary: aiScore.vocabulary || 70,
    rubric: {
      contentNotes: aiScore.rationale || '',
      fluencyNotes: `WPM: ${wordsPerMinute.toFixed(1)}, Filler rate: ${(fillerRate * 100).toFixed(1)}%`,
      pronunciationNotes: 'Based on AI analysis',
      templateDetected: templateResult.isTemplate,
      originalityScore: templateResult.originalityScore,
      templateIndicators: templateResult.matchedPhrases
    },
    feedback: {
      suggestions: generateSuggestions(aiScore, templateResult),
      strengths: extractStrengths(aiScore),
      areasForImprovement: extractWeaknesses(aiScore, templateResult)
    },
    meta: {
      provider: 'openai',
      wordsPerMinute,
      fillerRate,
      templateConfidence: templateResult.confidence
    }
  }

  // 6. Flag for human review if needed
  const needsHumanReview = shouldFlagForHumanReview(
    finalScore,
    templateResult,
    wordsPerMinute
  )

  return {
    ...finalScore,
    flaggedForHumanReview: needsHumanReview,
    humanReviewReason: needsHumanReview
      ? getReviewReason(templateResult, aiScore)
      : null
  }
}

function shouldFlagForHumanReview(
  score: SpeakingScore,
  templateResult: TemplateDetectionResult,
  wpm: number
): boolean {
  // Flag if template detected with high confidence
  if (templateResult.confidence > 0.7) return true

  // Flag if originality score is very low
  if (templateResult.originalityScore < 40) return true

  // Flag if content score is unusually high with low originality
  if (score.content > 80 && templateResult.originalityScore < 60) return true

  // Flag if speaking rate is suspiciously fast (memorized)
  if (wpm > 200) return true

  // Flag if content score and pronunciation score differ significantly
  // (might indicate read template vs natural speech)
  if (Math.abs(score.content - score.pronunciation) > 25) return true

  return false
}

function getReviewReason(
  templateResult: TemplateDetectionResult,
  aiScore: any
): string {
  const reasons: string[] = []

  if (templateResult.isTemplate) {
    reasons.push(`Template detected (${(templateResult.confidence * 100).toFixed(0)}% confidence)`)
  }

  if (templateResult.originalityScore < 40) {
    reasons.push(`Low originality score: ${templateResult.originalityScore}/100`)
  }

  if (templateResult.matchedPhrases.length > 3) {
    reasons.push(`Multiple template phrases: "${templateResult.matchedPhrases.slice(0, 3).join('", "')}"`)
  }

  return reasons.join('; ')
}
```

#### E. Update API Route
**File**: `app/api/speaking/attempts/route.ts` (Update)

```typescript
// In POST handler, after scoring:

const scoreResult = await scoreDescribeImageAttempt({
  question,
  transcript,
  audioUrl: uploadResult.blobUrl,
  durationMs
})

// Insert attempt with human review flags
const [attempt] = await db.insert(speakingAttempts).values({
  userId: session.user.id,
  questionId,
  type,
  audioUrl: uploadResult.blobUrl,
  transcript,
  scores: scoreResult,
  durationMs,
  wordsPerMinute: scoreResult.meta.wordsPerMinute,
  fillerRate: scoreResult.meta.fillerRate,
  timings,
  // November 2025 fields
  flaggedForHumanReview: scoreResult.flaggedForHumanReview || false,
  humanReviewReason: scoreResult.humanReviewReason,
  templateDetected: scoreResult.rubric?.templateDetected || false,
  templateConfidence: scoreResult.meta?.templateConfidence || 0,
  originalityScore: scoreResult.rubric?.originalityScore || 100
}).returning()

return NextResponse.json(attempt)
```

### 2. Enhanced UI Feedback

#### A. Score Details Dialog
**File**: `components/pte/ScoreDetailsDialog.tsx` (Update)

Add template detection indicators:

```tsx
{attempt.templateDetected && (
  <Alert variant="warning" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Template Detected</AlertTitle>
    <AlertDescription>
      This response contains common template phrases.
      For higher scores, use more specific, original descriptions
      of the visual content.
      {attempt.templateIndicators && (
        <div className="mt-2 text-sm">
          Detected phrases: {attempt.templateIndicators.join(', ')}
        </div>
      )}
    </AlertDescription>
  </Alert>
)}

{attempt.flaggedForHumanReview && (
  <Alert variant="info" className="mt-4">
    <Info className="h-4 w-4" />
    <AlertTitle>Under Review</AlertTitle>
    <AlertDescription>
      This response has been flagged for human review to ensure
      accurate assessment. Your final score may be adjusted.
      Reason: {attempt.humanReviewReason}
    </AlertDescription>
  </Alert>
)}
```

#### B. Originality Score Display
Add an "Originality" metric alongside other scores:

```tsx
<div className="grid grid-cols-2 gap-4 mt-4">
  <ScoreCard label="Content" score={scores.content} max={90} />
  <ScoreCard label="Pronunciation" score={scores.pronunciation} max={90} />
  <ScoreCard label="Fluency" score={scores.fluency} max={90} />
  <ScoreCard
    label="Originality"
    score={scores.rubric.originalityScore}
    max={100}
    description="Measures uniqueness vs. template usage"
  />
</div>
```

### 3. Human Review Admin Interface

Create an admin dashboard for human reviewers:

**File**: `app/admin/human-review/page.tsx`

```tsx
export default async function HumanReviewQueue() {
  const flaggedAttempts = await db
    .select()
    .from(speakingAttempts)
    .where(
      and(
        eq(speakingAttempts.flaggedForHumanReview, true),
        isNull(speakingAttempts.humanReviewedAt)
      )
    )
    .orderBy(desc(speakingAttempts.createdAt))
    .limit(50)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Human Review Queue</h1>

      <div className="grid gap-4">
        {flaggedAttempts.map(attempt => (
          <ReviewCard key={attempt.id} attempt={attempt} />
        ))}
      </div>
    </div>
  )
}
```

## Implementation Checklist

### Phase 1: Database & Backend (High Priority)
- [ ] Run database migration for human review columns
- [ ] Implement template detection algorithm
- [ ] Update scoring rubric for Describe Image
- [ ] Modify API route to store human review flags
- [ ] Add template detection to scoring pipeline

### Phase 2: Enhanced Scoring (High Priority)
- [ ] Create task-specific AI prompts for Describe Image
- [ ] Implement originality scoring
- [ ] Add automatic flagging logic
- [ ] Test template detection with sample responses

### Phase 3: UI Updates (Medium Priority)
- [ ] Add template detection warnings to ScoreDetailsDialog
- [ ] Display originality score
- [ ] Show human review status
- [ ] Add suggestions for avoiding templates

### Phase 4: Admin Interface (Medium Priority)
- [ ] Create human review queue page
- [ ] Add reviewer assignment system
- [ ] Implement score adjustment interface
- [ ] Add review history tracking

### Phase 5: Analytics & Monitoring (Low Priority)
- [ ] Track template detection rates
- [ ] Monitor human review turnaround times
- [ ] Analyze score adjustments
- [ ] Generate reports on common templates

## Testing Strategy

### Unit Tests
```typescript
describe('Template Detection', () => {
  it('should detect common template phrases', async () => {
    const transcript = "The given chart shows that overall the data indicates..."
    const result = await detectTemplate(transcript, 'describe_image')
    expect(result.isTemplate).toBe(true)
    expect(result.confidence).toBeGreaterThan(0.6)
  })

  it('should pass original responses', async () => {
    const transcript = "This bar chart illustrates male and female workers across various occupations in 1881..."
    const result = await detectTemplate(transcript, 'describe_image')
    expect(result.originalityScore).toBeGreaterThan(60)
  })
})
```

### Integration Tests
- Test full flow: record → upload → transcribe → detect template → score
- Verify flagged attempts appear in review queue
- Test human reviewer workflow

### User Acceptance Testing
- Have test users submit both templated and original responses
- Verify detection accuracy
- Check that feedback is helpful and actionable

## Deployment Plan

1. **Phase 1**: Deploy database migrations (no downtime)
2. **Phase 2**: Deploy backend template detection (feature flag)
3. **Phase 3**: Enable for 10% of users (A/B test)
4. **Phase 4**: Monitor detection accuracy and adjust thresholds
5. **Phase 5**: Full rollout
6. **Phase 6**: Deploy admin interface for human reviewers

## Success Metrics

- Template detection accuracy > 85%
- False positive rate < 10%
- Human review completion time < 24 hours
- User satisfaction with feedback quality
- Reduction in template usage over time

---

**Created**: November 16, 2025
**Status**: Design Complete, Ready for Implementation
**Compliance**: November 2025 PTE Academic Standards
