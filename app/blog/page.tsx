import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { strapiClient } from "@/lib/strapi/client"
import { Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Blog - PTE Academic Tips & Study Guides | Pedagogist's PTE",
  description: "Expert tips, study guides, and strategies for PTE Academic success. Learn from our comprehensive blog covering all question types and exam preparation techniques.",
}

export default async function BlogPage() {
  const response = await strapiClient.getBlogPosts({ pageSize: 12 })
  const posts = response.data || []
  const featured = posts.slice(0, 1)
  const regular = posts.slice(1)

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
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
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
              PTE Academic Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Expert tips, study guides, and strategies to help you ace your PTE Academic exam.
              Learn from experienced educators and successful test-takers.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured.length > 0 && (
        <section className="border-b py-12">
          <div className="container">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured</h2>
            </div>
            {featured.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group grid gap-6 lg:grid-cols-2"
              >
                {post.coverImage && (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={strapiClient.getImageURL(post.coverImage)}
                      alt={post.coverImage.alternativeText || post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  {post.category && (
                    <Badge className="mb-3 w-fit" variant="secondary">
                      {post.category}
                    </Badge>
                  )}
                  <h3 className="mb-3 text-3xl font-bold group-hover:text-primary">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mb-4 text-lg text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {strapiClient.formatDate(post.publishedAt)}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readingTime} min read
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 font-medium text-primary">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-8 text-2xl font-bold">Latest Posts</h2>
          {regular.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {regular.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                >
                  {post.coverImage && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={strapiClient.getImageURL(post.coverImage)}
                        alt={post.coverImage.alternativeText || post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    {post.category && (
                      <Badge className="mb-3 w-fit" variant="secondary">
                        {post.category}
                      </Badge>
                    )}
                    <h3 className="mb-2 text-xl font-bold group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {strapiClient.formatDate(post.publishedAt)}
                      </span>
                      {post.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Practicing?</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Join thousands of students preparing for PTE Academic with our AI-powered platform.
            </p>
            <Button asChild size="lg">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pedagogist's PTE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
