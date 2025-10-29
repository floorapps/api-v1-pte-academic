'use server';

import { z } from 'zod';
import { auth } from './auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, invitations, ActivityType, type NewTeam, type NewTeamMember, type NewActivityLog } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from './server';

async function logActivity(
  teamId: number | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId: parseInt(userId),
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export async function signInAction(prevState: any, formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, password } = result.data;

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    if (response?.error) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
      };
    }

    // Get user and team for activity logging
    const user = await getCurrentUser();
    if (user) {
      const teamMember = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1);

      if (teamMember.length > 0) {
        await logActivity(teamMember[0].teamId, user.id, ActivityType.SIGN_IN);
      }
    }

    redirect('/');
  } catch (error) {
    return {
      error: 'An error occurred during sign in. Please try again.',
      email,
    };
  }
}

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  inviteId: z.string().optional()
});

export async function signUpAction(prevState: any, formData: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, password, name, inviteId } = result.data;

  try {
    // Sign up with Better Auth
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split('@')[0],
      },
      headers: await headers(),
    });

    if (response?.error) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Failed to authenticate after sign up.' };
    }

    let teamId: number;
    let userRole: string;

    if (inviteId) {
      // Check if there's a valid invitation
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.id, parseInt(inviteId)),
            eq(invitations.email, email),
            eq(invitations.status, 'pending')
          )
        )
        .limit(1);

      if (invitation) {
        teamId = invitation.teamId;
        userRole = invitation.role;

        await db
          .update(invitations)
          .set({ status: 'accepted' })
          .where(eq(invitations.id, invitation.id));

        await logActivity(teamId, user.id, ActivityType.ACCEPT_INVITATION);
      } else {
        return { error: 'Invalid or expired invitation.', email };
      }
    } else {
      // Create a new team if there's no invitation
      const newTeam: NewTeam = {
        name: `${name || email}'s Team`
      };

      const [createdTeam] = await db.insert(teams).values(newTeam).returning();

      if (!createdTeam) {
        return {
          error: 'Failed to create team. Please try again.',
          email,
        };
      }

      teamId = createdTeam.id;
      userRole = 'owner';

      await logActivity(teamId, user.id, ActivityType.CREATE_TEAM);
    }

    const newTeamMember: NewTeamMember = {
      userId: user.id,
      teamId: teamId,
      role: userRole
    };

    await Promise.all([
      db.insert(teamMembers).values(newTeamMember),
      logActivity(teamId, user.id, ActivityType.SIGN_UP),
    ]);

    redirect('/');
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      error: 'An error occurred during sign up. Please try again.',
      email,
    };
  }
}

export async function signOutAction() {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      const teamMember = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1);

      if (teamMember.length > 0) {
        await logActivity(teamMember[0].teamId, user.id, ActivityType.SIGN_OUT);
      }
    }

    await auth.api.signOut({
      headers: await headers(),
    });

    redirect('/sign-in');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
