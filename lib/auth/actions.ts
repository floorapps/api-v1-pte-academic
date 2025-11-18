'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from './auth'

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
})

export async function signInAction(prevState: unknown, formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email, password } = result.data
  const redirectUrl = formData.get('redirect')?.toString() || '/pte/dashboard'

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    })

    if (!response || !response.user) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
      }
    }

    redirect(`${redirectUrl}?loggedin=true`)
  } catch (error) {
    return {
      error: 'An error occurred during sign in. Please try again.',
      email,
    }
  }
}

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function signUpAction(prevState: unknown, formData: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email, password, name } = result.data
  const redirectUrl = formData.get('redirect')?.toString() || '/pte/dashboard'

  try {
    // Sign up with Better Auth
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split('@')[0],
      },
      headers: await headers(),
    })

    if (!response || !response.user) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
      }
    }

    redirect(`${redirectUrl}?loggedin=true`)
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      error: 'An error occurred during sign up. Please try again.',
      email,
    }
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })

    redirect('/sign-in')
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}
