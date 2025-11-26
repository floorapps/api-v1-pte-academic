import React from 'react'
import { BookOpen, AudioLines, Sparkles, ChartBar, Timer, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    title: 'Official-Style Question Bank',
    description: '50,000+ authentic PTE questions covering all four sections: Speaking, Writing, Reading, and Listening. Practice with exam-realistic content updated monthly.',
    icon: BookOpen
  },
  {
    title: 'Intelligent AI Scoring',
    description: 'Get instant, detailed feedback powered by Google Gemini AI. Analyzes pronunciation, fluency, grammar, vocabulary, content accuracy, and enabling skills—just like the real PTE exam.',
    icon: Sparkles
  },
  {
    title: 'Advanced Speaking Practice',
    description: 'Professional-grade audio recorder with waveform visualization, playback controls, and detailed pronunciation analysis. Perfect your speaking skills with confidence.',
    icon: AudioLines
  },
  {
    title: 'Performance Analytics',
    description: 'Comprehensive progress tracking with visual insights, skill breakdowns, and personalized recommendations. Identify weaknesses and track improvement over time.',
    icon: ChartBar
  },
  {
    title: 'Exam-Accurate Timing',
    description: 'Practice with authentic PTE exam timers for every question type. Build the pacing skills and time management critical for test day success.',
    icon: Timer
  },
  {
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption protects your personal data, recordings, and practice history. GDPR compliant with secure cloud storage.',
    icon: Shield
  },
]

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="features-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Complete PTE Academic Preparation Platform</h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">Professional-grade tools designed by PTE experts to accelerate your learning and maximize your score potential.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <Card key={f.title} className="h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <span className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{f.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
