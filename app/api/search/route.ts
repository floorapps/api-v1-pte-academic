import { NextRequest, NextResponse } from 'next/server'

async function searchBlog(query: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/strapi/blog?search=${encodeURIComponent(query)}&page=1&pageSize=8`)
    const data = await res.json()
    const posts = Array.isArray(data?.data) ? data.data : []
    return posts.map((p: any) => ({
      title: p.attributes?.title || p.title,
      url: `/blog/${p.attributes?.slug || p.slug || ''}`,
      source: 'blog',
    }))
  } catch {
    return []
  }
}

async function searchMXBAI(query: string) {
  const key = process.env.MXBAI_API_KEY
  const store = process.env.MXBAI_STORE_ID
  if (!key || !store) return []
  try {
    const res = await fetch(`https://api.mxbai.com/v1/stores/${store}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, top_k: 8 }),
    })
    const data = await res.json()
    const items = Array.isArray(data?.results) ? data.results : []
    return items.map((i: any) => ({
      title: i.title || i.text || 'Result',
      url: i.url || '/',
      source: 'mxbai',
    }))
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('query') || ''
  if (!q.trim()) return NextResponse.json({ results: [] })
  const [blog, ai] = await Promise.all([searchBlog(q), searchMXBAI(q)])
  return NextResponse.json({ results: [...ai, ...blog] })
}