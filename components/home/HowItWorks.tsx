import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const STEPS = [
  {
    title: 'Choose Your Practice Module',
    desc: 'Select from Speaking, Writing, Reading, or Listening sections. Each module contains official-style questions tailored to real PTE exam patterns.',
  },
  {
    title: 'Get Instant AI-Powered Feedback',
    desc: 'Receive detailed scoring and personalized tips on pronunciation, fluency, grammar, vocabulary, and content quality—powered by advanced AI technology.',
  },
  {
    title: 'Track Progress & Improve',
    desc: 'Monitor your performance with comprehensive analytics. Identify weak areas, track score improvements, and follow personalized learning paths to achieve your target score.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="how-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Path to PTE Success
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          Three simple steps to transform your PTE preparation and achieve your desired score.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <Card className="h-full border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-start gap-3">
                <span
                  aria-hidden="true"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-lg"
                >
                  {i + 1}
                </span>
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">{step.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {i === 0 && (
                  <Button asChild variant="outline" size="sm" aria-label="Start practicing">
                    <Link href="/pte/academic/practice">Start Practicing →</Link>
                  </Button>
                )}
                {i === 1 && (
                  <p className="text-muted-foreground text-sm font-medium">✓ Instant feedback after each attempt</p>
                )}
                {i === 2 && (
                  <Button asChild size="sm" aria-label="View analytics">
                    <Link href="/pte/analytics">View Analytics →</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  )
}
