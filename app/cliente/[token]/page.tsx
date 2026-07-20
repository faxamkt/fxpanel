import { notFound } from "next/navigation";
import { ClientShell } from "@/components/client/ClientShell";
import { getClientInfo, getClientPosts } from "@/lib/actions/client-portal";

export default async function ClientePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const clientInfo = await getClientInfo(token);
  if (!clientInfo) notFound();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const posts = await getClientPosts(token, year, month);

  return (
    <ClientShell
      token={token}
      clientNome={clientInfo.nome}
      initialPosts={posts}
      initialYear={year}
      initialMonth={month}
    />
  );
}
