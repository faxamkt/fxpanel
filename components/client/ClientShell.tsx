"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { Legend } from "@/components/calendar/Legend";
import { MonthNav } from "@/components/calendar/MonthNav";
import { Logo } from "@/components/layout/Logo";
import { ClientPostDrawer } from "@/components/post/ClientPostDrawer";
import { ClientPost } from "@/lib/types";
import { getClientPosts } from "@/lib/actions/client-portal";

const POLL_INTERVAL_MS = 15_000;

export function ClientShell({
  token,
  clientNome,
  initialPosts,
  initialYear,
  initialMonth,
}: {
  token: string;
  clientNome: string;
  initialPosts: ClientPost[];
  initialYear: number;
  initialMonth: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [posts, setPosts] = useState<ClientPost[]>(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const refetch = useCallback(() => {
    getClientPosts(token, year, month).then(setPosts);
  }, [token, year, month]);

  // Pula o refetch no primeiro render: o servidor já entregou `initialPosts`
  // para (initialYear, initialMonth), então só buscamos de novo quando o
  // cliente navega pra outro mês.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refetch();
  }, [refetch]);

  // Sem sessão autenticada aqui, então o Realtime do Supabase (que depende de RLS)
  // não se aplica: o link do cliente reflete as mudanças do admin via polling curto.
  useEffect(() => {
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    function onVisible() {
      if (document.visibilityState === "visible") refetch();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refetch]);

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

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

  return (
    <div className="min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-faxa-amarelo bg-faxa-preto px-6 py-3.5 text-faxa-branco">
        <Logo subtitle={clientNome} />
      </div>

      <div className="bg-faxa-amarelo px-4 py-1.5 text-center text-xs font-bold text-faxa-preto">
        Você está vendo a grade de postagens de <b>{clientNome}</b> — acesso somente leitura / aprovação
      </div>

      <MonthNav year={year} month={month} onPrev={goPrevMonth} onNext={goNextMonth} />
      <Legend />

      <div className="px-6 pb-10">
        <CalendarGrid
          year={year}
          month={month}
          posts={posts}
          isAdmin={false}
          onPostClick={setSelectedPostId}
        />
      </div>

      <ClientPostDrawer
        key={selectedPostId ?? "empty"}
        open={selectedPostId !== null}
        token={token}
        post={selectedPost}
        onClose={() => setSelectedPostId(null)}
        onChanged={refetch}
      />
    </div>
  );
}
