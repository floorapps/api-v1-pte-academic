import React from 'react'

const STATS = [
  { label: 'Active Students Worldwide', value: '25,000+' },
  { label: 'Practice Questions', value: '50,000+' },
  { label: 'Mock Tests Completed', value: '120,000+' },
  { label: 'Average Score Improvement', value: '+12 Points' },
]

export default function Stats() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="bg-accent/30 text-accent-foreground/90 border-border/60 mx-auto w-full border-y"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="stats-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Trusted by PTE Students Worldwide
          </h2>
          <p className="text-muted-foreground mt-2 text-base">
            Join thousands of successful students who achieved their dream scores with our proven platform.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg px-4 py-6">
              <dt className="text-muted-foreground text-sm font-medium">{s.label}</dt>
              <dd className="mt-2 text-3xl font-bold sm:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
