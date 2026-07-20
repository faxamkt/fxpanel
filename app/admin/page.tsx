import { AdminShell } from "@/components/admin/AdminShell";
import { listClients } from "@/lib/actions/clients";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clients = await listClients();

  return <AdminShell initialClients={clients} adminName={user?.email ?? "equipe faxa"} />;
}
