'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, Award } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="relative bg-background text-foreground overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

      {/* Ripple Effect Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-400 mix-blend-multiply blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-400 mix-blend-multiply blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 h-96 w-96 rounded-full bg-pink-400 mix-blend-multiply blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative isolate pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56"
          >
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Powered PTE Practice Platform
                <TrendingUp className="h-4 w-4" />
              </Badge>
            </motion.div>

            <div className="text-center">
              {/* Main Heading with Gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
              >
                <span className="block">Master PTE Academic with</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-shimmer">
                  AI-Powered Excellence
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-muted-foreground mt-6 text-lg leading-8 sm:text-xl"
              >
                Join 25,000+ students achieving their desired scores with our
                AI-powered practice tests, instant feedback, and personalized study plans.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-10 flex items-center justify-center gap-x-6"
              >
                <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/sign-up">
                    Get Started Free
                    <Award className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/pricing">
                    View Pricing <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-blue-400 to-purple-400"
                      />
                    ))}
                  </div>
                  <span>25,000+ students</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>⭐️ 4.9/5 rating</div>
                <div className="h-4 w-px bg-border" />
                <div>+12 avg. score gain</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
