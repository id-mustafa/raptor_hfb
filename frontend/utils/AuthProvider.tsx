import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  username: string | null;
  setUsername: (name: string | null) => void;
  friends: string[];
  parties: string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  // placeholders for now, fetch/populate later
  const friends: string[] = [];
  const parties: string[] = [];

  return (
    <AuthContext.Provider value={{ username, setUsername, friends, parties }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
