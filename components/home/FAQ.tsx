'use client'

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type QA = {
  q: string
  a: string
}

const FAQS: QA[] = [
  {
    q: 'Can I try the platform for free?',
    a: 'Yes. The Free tier includes 1 full mock test, core practice, and limited daily AI scoring so you can evaluate the experience.',
  },
  {
    q: 'What is AI scoring and how accurate is it?',
    a: 'Our AI analyzes pronunciation, fluency, grammar, vocabulary, and content for speaking and writing tasks. It aligns closely with PTE rubrics to guide improvement.',
  },
  {
    q: 'Do mock tests follow real PTE timing?',
    a: 'Yes. Our mock tests simulate real exam timing and structure so you build the right pacing and confidence.',
  },
  {
    q: 'Can I upgrade or cancel anytime?',
    a: 'Absolutely. You can upgrade plans at any time and cancel whenever you like. Your access continues through the current billing period.',
  },
  {
    q: 'Is my data secure?',
    a: 'We use secure storage and encryption. Your recordings and results remain private and are only used to improve your learning.',
  },
  {
    q: 'Do I get analytics on progress?',
    a: 'Yes. Track performance trends across sections, find weak areas, and focus where gains matter most.',
  },
]

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          Quick answers about practice, scoring, and plans.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl sm:mt-16">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground sm:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}