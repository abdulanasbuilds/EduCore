import { createClient } from '@/lib/supabase/server'
import { user_role } from '@/types'

type AuthResult = {
  userId: string
  role: user_role
  schoolId: string
}

type AuthError = {
  error: string
}

/**
 * Use this at the top of every server action.
 * Returns the authenticated user's ID, role, and school_id.
 * Returns an error object if not authenticated or role doesn't match.
 */
export async function requireAuth(
  allowedRoles?: user_role[]
): Promise<AuthResult | AuthError> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { error: 'Authentication required.' }
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, school_id, is_active')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    return { error: 'Profile not found.' }
  }
  
  if (!profile.is_active) {
    return { error: 'Account is inactive.' }
  }
  
  if (!profile.school_id) {
    return { error: 'No school assigned to this account.' }
  }
  
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return { error: 'You do not have permission for this action.' }
  }
  
  return {
    userId: user.id,
    role: profile.role,
    schoolId: profile.school_id,
  }
}

// Type guard to check for error
export function isAuthError(
  result: AuthResult | AuthError
): result is AuthError {
  return 'error' in result
}