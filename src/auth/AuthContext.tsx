import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, EmailInUseError, InvalidCredentialsError } from '../types';

interface AuthContextType {
  currentUser: User | null;
  signup: (data: { name: string; email: string; password: string }) => Promise<User>;
  login: (data: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ff.currentUser';
const USERS_KEY = 'ff.users';

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generate simple ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Normalize email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current user from localStorage
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signup = async (data: { name: string; email: string; password: string }): Promise<User> => {
    const normalizedEmail = normalizeEmail(data.email);
    const users = getUsers();

    // Check if email already exists
    if (users.some(u => normalizeEmail(u.email) === normalizedEmail)) {
      throw new EmailInUseError();
    }

    // Validate password length
    if (data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Hash password
    const passHash = await hashPassword(data.password);

    // Create user
    const user: User = {
      id: generateId(),
      name: data.name.trim(),
      email: normalizedEmail,
      passHash,
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Set as current user
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  };

  const login = async (data: { email: string; password: string }): Promise<User> => {
    const normalizedEmail = normalizeEmail(data.email);
    const users = getUsers();

    // Find user by email
    const user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Hash provided password and compare
    const passHash = await hashPassword(data.password);
    if (user.passHash !== passHash) {
      throw new InvalidCredentialsError();
    }

    // Set as current user
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    // Note: We keep user data in localStorage for persistence
    // User-scoped data is already keyed by userId
  };

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getUsers(): User[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// RequireAuth HOC component
export const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      const currentPath = window.location.pathname + window.location.search;
      setShouldRedirect(true);
      window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!currentUser || shouldRedirect) {
    return null;
  }

  return <>{children}</>;
};

