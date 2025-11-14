'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Zap, Award } from 'lucide-react'
import {
  StripeLogo,
  VercelLogo,
  OpenAILogo,
  BetterAuthLogo,
  ResendLogo,
  PolarLogo,
  PostgreSQLLogo,
  NextJSLogo,
  TailwindLogo,
} from '@/components/ui/company-logos'

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and secure data storage',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'GDPR compliant with complete data control',
  },
  {
    icon: Zap,
    title: 'AI-Powered',
    description: 'Powered by OpenAI and Google Gemini',
  },
  {
    icon: Award,
    title: 'Trusted Platform',
    description: '25,000+ students worldwide',
  },
]

const logos = [
  { Component: NextJSLogo, name: 'Next.js' },
  { Component: OpenAILogo, name: 'OpenAI' },
  { Component: StripeLogo, name: 'Stripe' },
  { Component: VercelLogo, name: 'Vercel' },
  { Component: PostgreSQLLogo, name: 'PostgreSQL' },
  { Component: BetterAuthLogo, name: 'Better Auth' },
  { Component: ResendLogo, name: 'Resend' },
  { Component: PolarLogo, name: 'Polar' },
  { Component: TailwindLogo, name: 'Tailwind CSS' },
]

export default function TrustSection() {
  return (
    <section className="border-y bg-muted/30 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with Top-Class Security & Best-in-Class Tools
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your data is protected by industry-leading security standards and powered by the most trusted technologies.
            </p>
          </motion.div>
        </div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Powered By Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Powered by Industry Leaders
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-3 items-center gap-8 sm:grid-cols-5 lg:grid-cols-9">
            {logos.map(({ Component, name }) => (
              <div
                key={name}
                className="flex items-center justify-center opacity-60 transition-opacity hover:opacity-100 grayscale hover:grayscale-0"
                title={name}
              >
                <Component className="h-8 w-auto" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Certifications & Compliance */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mt-12 max-w-4xl text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>GDPR Compliant</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>SSL/TLS Encryption</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
