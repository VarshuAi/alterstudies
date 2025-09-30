"use client";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";

type Ctx = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  isAdmin: boolean;
};
const AuthCtx = createContext<Ctx>({ user: null, loading: true, signIn: async () => {}, signOutUser: async () => {}, isAdmin: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();

  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []);
  const signIn = async () => { await signInWithPopup(auth, googleProvider); };
  const signOutUser = async () => { await signOut(auth); };
  const isAdmin = !!user && (user.email || "").toLowerCase() === adminEmail;

  return <AuthCtx.Provider value={{ user, loading, signIn, signOutUser, isAdmin }}>{children}</AuthCtx.Provider>;
}
export function useAuth() { return useContext(AuthCtx); }
