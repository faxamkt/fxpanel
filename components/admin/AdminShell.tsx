"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Legend } from "@/components/calendar/Legend";
import { MonthNav } from "@/components/calendar/MonthNav";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { AdminPostDrawer } from "@/components/post/AdminPostDrawer";
import { Client, Post } from "@/lib/types";
import { getAdminPosts } from "@/lib/actions/posts";
import { createClient as createClientAction } from "@/lib/actions/clients";
import { logout } from "@/lib/actions/auth";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

type DrawerState = { mode: "new"; date: string } | { mode: "edit"; post: Post } | null;

export function AdminShell({ initialClients, adminName }: { initialClients: Client[]; adminName: string }) {
  const now = useMemo(() => new Date(), []);
  const [clients, setClients] = useState(initialClients);
  const [selectedClientId, setSelectedClientId] = useState(initialClients[0]?.id ?? "");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, startLoadingTransition] = useTransition();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const refetch = useCallback(() => {
    if (!selectedClientId) return;
    startLoadingTransition(async () => {
      setPosts(await getAdminPosts(selectedClientId, year, month));
    });
  }, [selectedClientId, year, month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Realtime: qualquer mudança feita por outro admin ou pelo cliente (via RPC)
  // atualiza a grade na hora, sem precisar de F5.
  useEffect(() => {
    if (!selectedClientId) return;
    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`admin-posts-${selectedClientId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `client_id=eq.${selectedClientId}` },
        refetch
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "approval_steps" }, refetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClientId, refetch]);

  function goPrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  async function handleNewClient() {
    const nome = window.prompt("Nome do novo cliente:");
    if (!nome?.trim()) return;
    const created = await createClientAction(nome.trim());
    setClients((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)));
    setSelectedClientId(created.id);
  }

  async function handleCopyLink() {
    if (!selectedClient) return;
    const url = `${window.location.origin}/cliente/${selectedClient.token_acesso}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-faxa-amarelo bg-faxa-preto px-6 py-3.5 text-faxa-branco">
        <Logo subtitle={selectedClient?.nome ?? "Selecione um cliente"} />
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="cursor-pointer rounded-lg border border-faxa-cinza-2 bg-faxa-preto-2 px-3 py-2 text-[13px] text-faxa-branco"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleNewClient}>
            + Novo cliente
          </Button>
          <Button variant="yellow" onClick={handleCopyLink} disabled={!selectedClient}>
            {linkCopied ? "Link copiado!" : "🔗 Copiar link do cliente"}
          </Button>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </div>

      <MonthNav
        year={year}
        month={month}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
        badge={loading ? "atualizando…" : adminName}
      />
      <Legend />

      <div className="px-6 pb-10">
        {selectedClient ? (
          <CalendarGrid
            year={year}
            month={month}
            posts={posts}
            isAdmin
            onAddDay={(date) => setDrawer({ mode: "new", date })}
            onPostClick={(postId) => {
              const post = posts.find((p) => p.id === postId);
              if (post) setDrawer({ mode: "edit", post });
            }}
          />
        ) : (
          <p className="py-10 text-center text-faxa-cinza-3">Cadastre um cliente para começar.</p>
        )}
      </div>

      <AdminPostDrawer
        key={drawer?.mode === "edit" ? drawer.post.id : drawer?.mode === "new" ? drawer.date : "empty"}
        open={drawer !== null}
        clientId={selectedClientId}
        post={drawer?.mode === "edit" ? drawer.post : null}
        defaultDate={drawer?.mode === "new" ? drawer.date : null}
        adminName={adminName}
        onClose={() => setDrawer(null)}
        onSaved={() => {
          setDrawer(null);
          refetch();
        }}
        onDeleted={() => {
          setDrawer(null);
          refetch();
        }}
      />
    </div>
  );
}
