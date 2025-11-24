'use server'

import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/drizzle'
import { getUserProfile } from '@/lib/db/queries'
import { userProfiles, users } from '@/lib/db/schema'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  targetScore: z.number().min(10).max(90).optional().default(65),
  examDate: z.string().optional(), // Will be converted to Date later
})

export async function updateProfile(prevState: unknown, formData: FormData) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Validate the form data
  const rawData = Object.fromEntries(formData)
  const validatedData = updateProfileSchema.safeParse({
    name: rawData.name as string,
    email: rawData.email as string,
    targetScore: Number(rawData.targetScore) || undefined,
    examDate: (rawData.examDate as string) || undefined,
  })

  if (!validatedData.success) {
    return { error: validatedData.error.errors[0].message }
  }

  const { name, email, targetScore, examDate } = validatedData.data

  try {
    // Update basic user fields
    const userUpdateResult = await db
      .update(users)
      .set({
        name,
        email,
      })
      .where(eq(users.id, user.id))
      .returning()

    if (!userUpdateResult || userUpdateResult.length === 0) {
      return { error: 'Failed to update user. User not found.' }
    }

    // Upsert profile-specific fields (targetScore, examDate)
    const profileResult = await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        targetScore: targetScore || 65,
        examDate: examDate ? new Date(examDate) : null,
      })
      // @ts-ignore drizzle onConflictDoUpdate available for pg dialect
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          targetScore: targetScore || 65,
          examDate: examDate ? new Date(examDate) : null,
        },
      })
      .returning()

    if (!profileResult || profileResult.length === 0) {
      return { error: 'Failed to update profile settings.' }
    }

    return {
      success: 'Profile updated successfully.',
      name,
      email,
      targetScore: targetScore || 65,
      examDate: examDate || null,
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}

// Specific function for updating just the target score
export async function updateTargetScore(targetScore: number) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    const updated = existing.length
      ? await db
          .update(userProfiles)
          .set({ targetScore })
          .where(eq(userProfiles.userId, user.id))
          .returning()
      : await db
          .insert(userProfiles)
          .values({ userId: user.id, targetScore })
          .returning()

    return updated[0]
  } catch (error) {
    console.error('Error updating target score:', error)
    throw new Error('Failed to update target score')
  }
}

// Specific function for updating just the exam date
export async function updateExamDate(examDate: Date) {
  const user = await getUserProfile()
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    const updated = existing.length
      ? await db
          .update(userProfiles)
          .set({ examDate })
          .where(eq(userProfiles.userId, user.id))
          .returning()
      : await db
          .insert(userProfiles)
          .values({ userId: user.id, examDate })
          .returning()

    return updated[0]
  } catch (error) {
    console.error('Error updating exam date:', error)
    throw new Error('Failed to update exam date')
  }
}
