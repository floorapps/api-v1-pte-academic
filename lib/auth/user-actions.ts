'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  teams,
  teamMembers,
  activityLogs,
  invitations,
  ActivityType,
  type NewActivityLog,
  type User,
} from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { auth } from './auth';
import { headers } from 'next/headers';

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
    userId: user.id,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export async function updateAccount(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = updateAccountSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email } = result.data;
  const userWithTeam = await getUserWithTeam(user.id);

  await Promise.all([
    db.update(users).set({ name, email }).where(eq(users.id, user.id)),
    logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
  ]);

  return { name, success: 'Account updated successfully.' };
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export async function updatePassword(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { currentPassword, newPassword, confirmPassword } = result.data;

  if (currentPassword === newPassword) {
    return {
      error: 'New password must be different from the current password.'
    };
  }

  if (confirmPassword !== newPassword) {
    return {
      error: 'New password and confirmation password do not match.'
    };
  }

  try {
    // Use Better Auth to update password
    await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
      },
      headers: await headers(),
    });

    const userWithTeam = await getUserWithTeam(user.id);
    await logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD);

    return {
      success: 'Password updated successfully.'
    };
  } catch (error) {
    return {
      error: 'Failed to update password. Please check your current password.'
    };
  }
}

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export async function deleteAccount(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = deleteAccountSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const userWithTeam = await getUserWithTeam(user.id);

  await logActivity(
    userWithTeam?.teamId,
    user.id,
    ActivityType.DELETE_ACCOUNT
  );

  // Soft delete
  // Remove team membership if exists
  if (userWithTeam?.teamId) {
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );
  }

  // Delete the user account
  await db.delete(users).where(eq(users.id, user.id));

  // Sign out using Better Auth
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect('/sign-in');
}

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export async function removeTeamMember(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = removeTeamMemberSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { memberId } = result.data;
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  await db
    .delete(teamMembers)
    .where(
      and(
        eq(teamMembers.id, memberId),
        eq(teamMembers.teamId, userWithTeam.teamId)
      )
    );

  await logActivity(
    userWithTeam.teamId,
    user.id,
    ActivityType.REMOVE_TEAM_MEMBER
  );

  return { success: 'Team member removed successfully' };
}

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export async function inviteTeamMember(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = inviteTeamMemberSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, role } = result.data;
  const userWithTeam = await getUserWithTeam(user.id);

  if (!userWithTeam?.teamId) {
    return { error: 'User is not part of a team' };
  }

  const existingMember = await db
    .select()
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(
      and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
    )
    .limit(1);

  if (existingMember.length > 0) {
    return { error: 'User is already a member of this team' };
  }

  // Check if there's an existing invitation
  const existingInvitation = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, email),
        eq(invitations.teamId, userWithTeam.teamId),
        eq(invitations.status, 'pending')
      )
    )
    .limit(1);

  if (existingInvitation.length > 0) {
    return { error: 'An invitation has already been sent to this email' };
  }

  // Create a new invitation
  await db.insert(invitations).values({
    teamId: userWithTeam.teamId,
    email,
    role,
    invitedBy: parseInt(user.id),
    status: 'pending'
  });

  await logActivity(
    userWithTeam.teamId,
    user.id,
    ActivityType.INVITE_TEAM_MEMBER
  );

  // TODO: Send invitation email
  // await sendInvitationEmail(email, userWithTeam.team.name, role)

  return { success: 'Invitation sent successfully' };
}
