import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Only a publishable key belongs in the browser. RLS enforces ownership.
export const supabase = url && key ? createClient(url, key) : null

export function authRedirect(recovery = false) {
  const url = new URL(window.location.pathname, window.location.origin)
  if (recovery) url.searchParams.set('flow', 'recovery')
  return url.href
}

export function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return 'Something went wrong. Check your connection and try again.'
}
