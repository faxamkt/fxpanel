import { AdminShell } from "@/components/admin/AdminShell";
import { listClients } from "@/lib/actions/clients";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clients = await listClients();

  // O e-mail é sintético (usuario@painelfx.local, ver lib/actions/auth.ts) —
  // mostramos só a parte do usuário, sem o domínio fake.
  const adminName = user?.email?.split("@")[0] ?? "equipe faxa";

  return <AdminShell initialClients={clients} adminName={adminName} />;
}
