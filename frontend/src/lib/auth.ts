// Simple authentication utility using environment variables
// For MVP: validates against USER_ID and USER_PASSWORD from .env

export interface AuthCredentials {
  userId: string;
  password: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  userId: string | null;
}

// Validate credentials against environment variables
export function validateCredentials(userId: string, password: string): boolean {
  const envUserId = process.env.NEXT_PUBLIC_USER_ID || process.env.USER_ID || '';
  const envPassword = process.env.NEXT_PUBLIC_USER_PASSWORD || process.env.USER_PASSWORD || '';

  return userId === envUserId && password === envPassword;
}

// Get current session from localStorage
export function getAuthSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, userId: null };
  }

  const session = localStorage.getItem('memorynest_auth_session');
  if (!session) {
    return { isAuthenticated: false, userId: null };
  }

  try {
    const parsed = JSON.parse(session);
    return {
      isAuthenticated: !!parsed.userId,
      userId: parsed.userId || null,
    };
  } catch {
    return { isAuthenticated: false, userId: null };
  }
}

// Set authentication session
export function setAuthSession(userId: string): void {
  if (typeof window === 'undefined') return;

  const session: AuthSession = {
    isAuthenticated: true,
    userId,
  };

  localStorage.setItem('memorynest_auth_session', JSON.stringify(session));
}

// Clear authentication session
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('memorynest_auth_session');
}

// Login function
export async function login(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!userId.trim() || !password.trim()) {
    return { success: false, error: 'User ID and password are required' };
  }

  if (validateCredentials(userId, password)) {
    setAuthSession(userId);
    return { success: true };
  }

  return { success: false, error: 'Invalid User ID or password' };
}

// Logout function
export function logout(): void {
  clearAuthSession();
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthSession().isAuthenticated;
}
