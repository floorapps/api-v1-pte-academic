'use server';

import "server-only";
import { revalidateTag, revalidatePath } from 'next/cache';
import { CacheTags } from './cache';

/**
 * Revalidate specific cache tags
 */
export async function revalidateCacheTags(tags: string[]) {
  tags.forEach((tag) => {
    revalidateTag(tag);
  });
}

/**
 * Revalidate user-related caches
 */
export async function revalidateUserCache(userId: string) {
  revalidateTag(CacheTags.USER);
  revalidateTag(`${CacheTags.USER_PROFILE}-${userId}`);
  revalidateTag(`${CacheTags.USER_SUBSCRIPTION}-${userId}`);
}

/**
 * Revalidate PTE test caches
 */
export async function revalidatePTECache() {
  revalidateTag(CacheTags.PTE_TESTS);
  revalidateTag(CacheTags.PTE_QUESTIONS);
}

/**
 * Revalidate test attempt caches for a user
 */
export async function revalidateUserAttempts(userId: string) {
  revalidateTag(`${CacheTags.PTE_ATTEMPTS}-${userId}`);
  revalidateTag(`${CacheTags.PTE_HISTORY}-${userId}`);
}

/**
 * Revalidate community caches
 */
export async function revalidateCommunityCache() {
  revalidateTag(CacheTags.COMMUNITY_POSTS);
  revalidateTag(CacheTags.COMMUNITY_TRENDING);
  revalidateTag(CacheTags.COMMUNITY_CONTRIBUTORS);
}

/**
 * Revalidate specific paths
 */
export async function revalidateAppPath(path: string) {
  revalidatePath(path);
}

/**
 * Clear all PTE-related caches (use sparingly)
 */
export async function revalidateAllPTE() {
  Object.values(CacheTags).forEach((tag) => {
    if (tag.startsWith('pte-') || tag.startsWith('PTE_')) {
      revalidateTag(tag);
    }
  });
}
