import { NextRequest, NextResponse } from "next/server"
import { strapiClient } from "@/lib/strapi/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const category = searchParams.get("category") || undefined
    const tag = searchParams.get("tag") || undefined
    const search = searchParams.get("search") || undefined

    const response = await strapiClient.getBlogPosts({
      page,
      pageSize,
      category,
      tag,
      search,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Blog API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}
