// app/(auth)/auth/page.tsx
export const dynamic = "force-dynamic"; // ✅ allow dynamic rendering
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Auth from "@/components/Auth";

export default async function AuthPage() {
  /* 1️⃣  Grab the cookie store – note the await */
  const cookieStore = await cookies(); // ← this was the missing await 🔥

  /* 2️⃣  Wire up Supabase SSR */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // in a Server Component this may be a no-op, so wrap in try/catch
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* ignore */
          }
        },
      },
    }
  );

  /* 3️⃣  Server-side auth check (uses getUser to revalidate JWT) */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/"); // already logged in ➜ kick to home

  /* 4️⃣  Otherwise render the email/password form */
  return <Auth />;
}
