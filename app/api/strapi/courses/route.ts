import { NextRequest, NextResponse } from "next/server"
import { strapiClient } from "@/lib/strapi/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "12")
    const level = searchParams.get("level") || undefined
    const isPremium = searchParams.get("isPremium")
      ? searchParams.get("isPremium") === "true"
      : undefined

    const response = await strapiClient.getCourses({
      page,
      pageSize,
      level,
      isPremium,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
