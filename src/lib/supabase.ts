import { createClient, AuthError, AuthResponse } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { data, error }: { data: AuthResponse | null; error: AuthError | null } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

    if (error) {
      throw new Error(error.message);
    }

    return data as AuthResponse;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error }: { error: AuthError | null } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};
