import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSignedIn as hasLocalSession } from "@/lib/admin-auth";

/**
 * Staff identity for the console.
 *
 * With Supabase configured, identity comes from a signed Supabase session and
 * an explicit row in `public.staff`. An account that exists in Authentication
 * but has no staff row is treated as unauthorised: creating a login is not
 * enough to publish content.
 *
 * Without Supabase (local development, preview builds) the console falls back
 * to the local staff password, and only then with the admin role.
 */

export type StaffRole = "editor" | "admin";

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
};

export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("staff")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile.full_name || user.email || "Staff",
      role: profile.role === "admin" ? "admin" : "editor",
    };
  }

  if (await hasLocalSession()) {
    return {
      id: "local",
      email: "local@preview.invalid",
      name: "Local staff",
      role: "admin",
    };
  }

  return null;
});

export async function requireStaff(): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role !== "admin") redirect("/admin?error=forbidden");
  return user;
}
