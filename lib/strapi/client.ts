/**
 * Strapi CMS API Client
 * Handles all interactions with the Strapi backend for blog posts and courses
 */

const STRAPI_API_URL = process.env.STRAPI_API_URL || "https://strapi-production-1ee4.up.railway.app"
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || ""

export interface StrapiImage {
  id: number
  url: string
  alternativeText?: string
  width?: number
  height?: number
}

export interface BlogPost {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt?: string
  content: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    avatar?: StrapiImage
  }
  coverImage?: StrapiImage
  category?: string
  tags?: string[]
  readingTime?: number
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

export interface Course {
  id: number
  documentId: string
  title: string
  slug: string
  description: string
  content: string
  level: "beginner" | "intermediate" | "advanced"
  duration?: number
  lessonsCount?: number
  enrolled?: number
  rating?: number
  price?: number
  isPremium: boolean
  coverImage?: StrapiImage
  instructor?: {
    name: string
    bio?: string
    avatar?: StrapiImage
  }
  lessons?: Array<{
    id: number
    title: string
    duration?: number
    order: number
  }>
}

export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

class StrapiClient {
  private baseURL: string
  private token: string

  constructor() {
    this.baseURL = STRAPI_API_URL
    this.token = STRAPI_API_TOKEN
  }

  private async fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        next: { revalidate: 60 }, // Cache for 60 seconds
      })

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Strapi API fetch error:", error)
      throw error
    }
  }

  // Blog Posts
  async getBlogPosts(params?: {
    page?: number
    pageSize?: number
    category?: string
    tag?: string
    search?: string
  }): Promise<StrapiResponse<BlogPost[]>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("pagination[page]", params.page.toString())
    if (params?.pageSize) queryParams.append("pagination[pageSize]", params.pageSize.toString())
    if (params?.category) queryParams.append("filters[category][$eq]", params.category)
    if (params?.tag) queryParams.append("filters[tags][$contains]", params.tag)
    if (params?.search) queryParams.append("filters[$or][0][title][$containsi]", params.search)

    queryParams.append("populate", "*")
    queryParams.append("sort[0]", "publishedAt:desc")

    return this.fetchAPI(`/blog-posts?${queryParams}`)
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const response = await this.fetchAPI<StrapiResponse<BlogPost[]>>(
      `/blog-posts?filters[slug][$eq]=${slug}&populate=*`
    )

    return response.data?.[0] || null
  }

  async getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
    const response = await this.fetchAPI<StrapiResponse<BlogPost[]>>(
      `/blog-posts?filters[featured][$eq]=true&populate=*&pagination[limit]=${limit}`
    )

    return response.data || []
  }

  // Courses
  async getCourses(params?: {
    page?: number
    pageSize?: number
    level?: string
    isPremium?: boolean
  }): Promise<StrapiResponse<Course[]>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append("pagination[page]", params.page.toString())
    if (params?.pageSize) queryParams.append("pagination[pageSize]", params.pageSize.toString())
    if (params?.level) queryParams.append("filters[level][$eq]", params.level)
    if (params?.isPremium !== undefined) {
      queryParams.append("filters[isPremium][$eq]", params.isPremium.toString())
    }

    queryParams.append("populate", "*")
    queryParams.append("sort[0]", "createdAt:desc")

    return this.fetchAPI(`/courses?${queryParams}`)
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const response = await this.fetchAPI<StrapiResponse<Course[]>>(
      `/courses?filters[slug][$eq]=${slug}&populate=*`
    )

    return response.data?.[0] || null
  }

  async getFeaturedCourses(limit: number = 3): Promise<Course[]> {
    const response = await this.fetchAPI<StrapiResponse<Course[]>>(
      `/courses?filters[featured][$eq]=true&populate=*&pagination[limit]=${limit}`
    )

    return response.data || []
  }

  // Categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<StrapiResponse<Array<{ category: string }>>>(
        "/blog-posts?fields[0]=category"
      )

      const categories = response.data
        .map((post) => post.category)
        .filter((cat): cat is string => !!cat)

      return Array.from(new Set(categories))
    } catch {
      return []
    }
  }

  // Tags
  async getTags(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<StrapiResponse<Array<{ tags: string[] }>>>(
        "/blog-posts?fields[0]=tags"
      )

      const allTags = response.data
        .flatMap((post) => post.tags || [])
        .filter((tag): tag is string => !!tag)

      return Array.from(new Set(allTags))
    } catch {
      return []
    }
  }

  // Utility: Get full image URL
  getImageURL(image?: StrapiImage): string {
    if (!image?.url) return "/placeholder-image.jpg"

    if (image.url.startsWith("http")) {
      return image.url
    }

    return `${this.baseURL}${image.url}`
  }

  // Utility: Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Utility: Calculate reading time
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const strapiClient = new StrapiClient()
