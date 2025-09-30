"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, signIn, signOutUser, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/alterstudies-icon.svg" alt="AlterStudies" className="h-7 w-7" />
          <span className="font-semibold">AlterStudies</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/batches/11" className="hover:underline">Class 11</Link>
          <Link href="/batches/12" className="hover:underline">Class 12</Link>
          <Link href="/tests" className="hover:underline">Tests</Link>
          <Link href="/notifications" className="hover:underline">Notifications</Link>
          {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
          {!user ? (
            <button className="btn" onClick={signIn}>Sign in</button>
          ) : (
            <button className="px-3 py-1.5 rounded border" onClick={signOutUser}>
              {user.displayName?.split(" ")[0] || "Account"} ▾
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
