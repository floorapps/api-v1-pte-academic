"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RealtimeVoiceAgent } from "@/components/ui/realtime-voice-agent"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      category: formData.get("category"),
      message: formData.get("message"),
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus("success")
        ;(e.target as HTMLFormElement).reset()
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="font-bold">Pedagogist's PTE</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Button asChild size="sm">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help. Contact our support team or chat with our AI assistant.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="space-y-8 lg:col-span-1">
            <div>
              <h2 className="mb-6 text-2xl font-bold">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href="mailto:support@pedagogistpte.com" className="text-sm text-muted-foreground hover:text-primary">
                      support@pedagogistpte.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <p className="text-sm text-muted-foreground">Available 24/7 via AI assistant</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Response Time</div>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-3 font-semibold">AI Voice Assistant</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get instant answers by talking to our AI support agent powered by OpenAI.
              </p>
              <RealtimeVoiceAgent
                sessionType="customer_support"
                instructions="You are a helpful support assistant for Pedagogist's PTE Academic platform. Answer questions about PTE exam preparation, practice tests, scoring, subscriptions, and technical issues. Be friendly, concise, and helpful."
                onTranscript={(transcript, role) => console.log(`${role}: ${transcript}`)}
                onSessionEnd={(sessionId, turns) => console.log(`Session ${sessionId} ended with ${turns.length} turns`)}
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Brief subject line"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    ✓ Message sent successfully! We'll get back to you within 24 hours.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    ✗ Failed to send message. Please try again or email us directly.
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How quickly will I receive a response?</AccordionTrigger>
                  <AccordionContent>
                    We typically respond to all inquiries within 24 hours during business days.
                    For urgent technical issues, our AI assistant is available 24/7 for immediate help.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What information should I include in my message?</AccordionTrigger>
                  <AccordionContent>
                    Please provide as much detail as possible: your account email (if applicable),
                    a clear description of your question or issue, and any relevant screenshots.
                    This helps us assist you more effectively.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Do you offer phone support?</AccordionTrigger>
                  <AccordionContent>
                    Currently, we provide support via email and our AI voice assistant. Phone support
                    is coming soon for Premium subscribers. In the meantime, our AI assistant can
                    handle most queries instantly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I schedule a demo or consultation?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Premium users can schedule one-on-one consultations with our PTE experts.
                    Select "Partnership" as the category above to inquire about institutional demos
                    or bulk licensing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I report a technical bug?</AccordionTrigger>
                  <AccordionContent>
                    Choose "Technical Support" as the category and include: 1) What you were trying to do,
                    2) What happened instead, 3) Your browser and device info, 4) Screenshots if possible.
                    Critical bugs are prioritized and addressed within 48 hours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>What if I have billing questions?</AccordionTrigger>
                  <AccordionContent>
                    For billing inquiries, select "Billing & Payments" and include your account email.
                    Common issues like subscription changes, refunds, and payment methods are typically
                    resolved within 1 business day. See our{" "}
                    <Link href="/legal/refund" className="text-primary underline">
                      Refund Policy
                    </Link>{" "}
                    for more information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Pedagogist's PTE. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/legal/accessibility" className="text-muted-foreground hover:text-foreground">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
