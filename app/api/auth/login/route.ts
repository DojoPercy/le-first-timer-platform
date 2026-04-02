import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AppRole = "super_admin" | "admin" | "caller";

function getRedirectForRole(role: AppRole) {
  if (role === "super_admin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin";
  return "/caller";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const pendingCookies: Array<{
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }> = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { message: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const requiredRole =
      body.requiredRole === "super_admin" ||
      body.requiredRole === "admin" ||
      body.requiredRole === "caller"
        ? (body.requiredRole as AppRole)
        : null;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user?.id) {
      return NextResponse.json(
        { message: error?.message || "Failed to sign in." },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();
    const { data: caller, error: callerError } = await adminClient
      .from("callers")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (callerError || !caller?.role) {
      await supabase.auth.signOut();
      const errorResponse = NextResponse.json(
        { message: "User profile not found." },
        { status: 403 }
      );
      pendingCookies.forEach(({ name, value, options }) => {
        errorResponse.cookies.set(name, value, options as any);
      });
      return errorResponse;
    }

    const resolvedRole = caller.role as AppRole;
    if (requiredRole && resolvedRole !== requiredRole) {
      await supabase.auth.signOut();
      const errorResponse = NextResponse.json(
        {
          message:
            requiredRole === "super_admin"
              ? "This portal is reserved for superadmins only."
              : "You are not allowed to use this login route.",
        },
        { status: 403 }
      );
      pendingCookies.forEach(({ name, value, options }) => {
        errorResponse.cookies.set(name, value, options as any);
      });
      return errorResponse;
    }

    const response = NextResponse.json({
      role: resolvedRole,
      redirectTo: getRedirectForRole(resolvedRole),
    });

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as any);
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
