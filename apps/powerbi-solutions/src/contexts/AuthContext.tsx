import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  authProvider?: string;
  tier?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
}

type AuthPayload = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  authProvider?: unknown;
  tier?: unknown;
};

const AUTH_API_BASE = '/api/auth';
const AuthContext = createContext<AuthContextType | null>(null);

function buildUser(data: AuthPayload): User | null {
  if (typeof data.id !== 'string' || typeof data.name !== 'string' || typeof data.email !== 'string') {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    authProvider: typeof data.authProvider === 'string' ? data.authProvider : undefined,
    tier: typeof data.tier === 'string' ? data.tier : undefined,
  };
}

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

function getErrorMessage(payload: Record<string, unknown>, fallback: string) {
  const message = typeof payload.error === 'string'
    ? payload.error
    : typeof payload.message === 'string'
      ? payload.message
      : fallback;

  return message.trim() || fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${AUTH_API_BASE}/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = await readJson(response);
      setUser(buildUser(payload));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${AUTH_API_BASE}/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const payload = await readJson(response);
        if (!cancelled) {
          setUser(buildUser(payload));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await readJson(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(payload, 'Unable to sign in right now.') };
      }

      const nextUser = buildUser(payload.user as AuthPayload);
      if (!nextUser) {
        return { success: false, error: 'The server returned an invalid session response.' };
      }

      setUser(nextUser);
      setAuthDialogOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach the sign-in service right now.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API_BASE}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await readJson(response);
      if (!response.ok) {
        return { success: false, error: getErrorMessage(payload, 'Unable to create your account right now.') };
      }

      const nextUser = buildUser(payload.user as AuthPayload);
      if (!nextUser) {
        return { success: false, error: 'The server returned an invalid session response.' };
      }

      setUser(nextUser);
      setAuthDialogOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to reach the sign-up service right now.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch(`${AUTH_API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Clear local session state even when the network call fails.
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        isAuthDialogOpen,
        setAuthDialogOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
