import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar variant="admin" userRole="admin" />
      <div className="lg:pl-72">
        <div className="h-14 lg:h-0 lg:mt-0" />
        <main className="p-4 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
