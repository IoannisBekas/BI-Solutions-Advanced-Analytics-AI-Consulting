import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (name: string, email: string, password: string) => { success: boolean; error?: string };
  signInWithGoogle: () => void;
  signOut: () => void;
  isAuthDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'powerbi_solutions_user';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidStoredUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as User).name === 'string' &&
    typeof (data as User).email === 'string' &&
    (data as User).name.length > 0 &&
    EMAIL_REGEX.test((data as User).email)
  );
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed: unknown = JSON.parse(stored);
      return isValidStoredUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signIn = (email: string, password: string) => {
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    // NOTE: This is a client-side demo auth. A production app should validate
    // credentials against a backend server with proper password hashing.
    const newUser: User = { name: email.split('@')[0], email };
    setUser(newUser);
    setAuthDialogOpen(false);
    return { success: true };
  };

  const signUp = (name: string, email: string, password: string) => {
    if (!name.trim()) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    const newUser: User = { name: name.trim(), email };
    setUser(newUser);
    setAuthDialogOpen(false);
    return { success: true };
  };

  const signInWithGoogle = () => {
    // TODO: Implement real OAuth 2.0 flow with Google.
    // For now, this is a demo placeholder that creates a local session.
    const newUser: User = { name: 'Demo User', email: 'demo@powerbi-solutions.app' };
    setUser(newUser);
    setAuthDialogOpen(false);
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signInWithGoogle, signOut, isAuthDialogOpen, setAuthDialogOpen }}
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
