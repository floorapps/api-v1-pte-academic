import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { userScheduledExamDates } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examDates = await db
      .select()
      .from(userScheduledExamDates)
      .where(eq(userScheduledExamDates.userId, user.id))
      .orderBy(userScheduledExamDates.examDate);

    return NextResponse.json({ examDates });
  } catch (error) {
    console.error("Error fetching exam dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam dates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examDate, examName, isPrimary } = await request.json();

    if (!examDate) {
      return NextResponse.json(
        { error: "Exam date is required" },
        { status: 400 }
      );
    }

    const date = new Date(examDate);
    if (date < new Date()) {
      return NextResponse.json(
        { error: "Exam date cannot be in the past" },
        { status: 400 }
      );
    }

    // If marking as primary, unset other primaries
    if (isPrimary) {
      await db
        .update(userScheduledExamDates)
        .set({ isPrimary: false })
        .where(eq(userScheduledExamDates.userId, user.id));
    }

    const newExamDate = await db
      .insert(userScheduledExamDates)
      .values({
        userId: user.id,
        examDate: date,
        examName: examName || "PTE Academic",
        isPrimary: isPrimary ?? true,
      })
      .returning();

    return NextResponse.json({ success: true, examDate: newExamDate[0] });
  } catch (error) {
    console.error("Error creating exam date:", error);
    return NextResponse.json(
      { error: "Failed to create exam date" },
      { status: 500 }
    );
  }
}
