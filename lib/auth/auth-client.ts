"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  fetch: (url: string, options?: RequestInit) => {
    if (options?.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      if (url.includes('/sign-in/social') || url.includes('/sign-up')) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(options.body)) {
          formData.append(key, String(value));
        }
        options.body = formData;
      } else {
        options.body = JSON.stringify(options.body);
        if (!options.headers) options.headers = {};
        (options.headers as any)['Content-Type'] = 'application/json';
      }
    }
    return fetch(url, options);
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Custom hook to check if user is authenticated
export function useAuth() {
  const { data: session, isPending } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isPending,
  };
}
