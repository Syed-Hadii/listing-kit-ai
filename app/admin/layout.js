import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AdminTopbar } from "@/components/dashboard/AdminTopbar";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar variant="admin" userRole="admin" />
      <div className="lg:pl-72 min-h-screen flex flex-col">
        <AdminTopbar />
        <main className="p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 w-full flex-1">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
