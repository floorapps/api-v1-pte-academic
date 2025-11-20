import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { strapiClient } from "@/lib/strapi/client"
import { Clock, Calendar, ChevronLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await strapiClient.getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.seo?.metaTitle || `${post.title} - Pedagogist's PTE Blog`,
    description: post.seo?.metaDescription || post.excerpt || "",
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.coverImage ? [strapiClient.getImageURL(post.coverImage)] : [],
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const post = await strapiClient.getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const readingTime = post.readingTime || strapiClient.calculateReadingTime(post.content)

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

      {/* Article */}
      <article className="py-12">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              {post.category && (
                <Badge className="mb-4" variant="secondary">
                  {post.category}
                </Badge>
              )}
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {strapiClient.formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </span>
                {post.author && (
                  <span className="flex items-center gap-2">
                    By {post.author.name}
                  </span>
                )}
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
                <Image
                  src={strapiClient.getImageURL(post.coverImage)}
                  alt={post.coverImage.alternativeText || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h3 className="mb-3 text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 flex items-center justify-between border-t pt-8">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to all posts
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Start Your PTE Journey Today</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Practice with AI-powered scoring and get instant feedback on your performance.
            </p>
            <Button asChild size="lg">
              <Link href="/sign-up">Try Free Now</Link>
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
