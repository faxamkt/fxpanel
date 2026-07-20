import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Client para uso em Server Components / Server Actions / Route Handlers,
// autenticado com a sessão da equipe faxa (cookies).
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // chamado a partir de um Server Component sem permissão de escrita —
          // o middleware já cuida de renovar a sessão nesse caso.
        }
      },
    },
  });
}

// Client anônimo (sem cookies de sessão) para as páginas públicas /cliente/[token].
// A segurança não depende deste client ser "anon": o isolamento entre clientes
// é garantido pelas funções RPC do banco, que exigem o token_acesso correto.
export function createAnonSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // client somente leitura, não gerencia sessão
      },
    },
  });
}
