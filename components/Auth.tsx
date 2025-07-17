"use client";

import { useState, useEffect } from "react";
import { createClient, SupabaseClient, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

/** -----------------------------------------------------------
 *                🔌  SUPABASE CLIENT (shared)
 * ----------------------------------------------------------*/
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "⛔️ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/** -----------------------------------------------------------
 *               🛂  AUTH COMPONENT (email + password)
 * ----------------------------------------------------------*/
interface AuthProps {
  /** Optional callback fired whenever the user's auth state changes */
  onAuth?: (session: Session | null) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  /* ---------------------------------------------------------
   *  🔄  LISTEN FOR SESSION CHANGES
   * --------------------------------------------------------*/
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      onAuth?.(data.session);
    });

    // Real‑time listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      onAuth?.(session);
    });

    return () => subscription.unsubscribe();
  }, [onAuth]);

  /* ---------------------------------------------------------
   *  🚪  HANDLERS: sign in / sign up
   * --------------------------------------------------------*/
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  /* ---------------------------------------------------------
   *  🖥  RENDER
   * --------------------------------------------------------*/
  if (session) return redirect("/"); // The parent decides what to render when authenticated

  return (
    <Card className="max-w-sm mx-auto mt-24 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">Welcome back</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button className="w-full" onClick={handleSignIn} disabled={loading}>
            Sign in
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignUp}
            disabled={loading}
          >
            Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
