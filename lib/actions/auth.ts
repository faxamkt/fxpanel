"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

// O Supabase Auth exige um e-mail internamente, mas a equipe faxa loga só com
// usuário e senha — então convertemos "joao" em "joao@painelfx.local" por baixo.
// Os usuários precisam ser cadastrados no Supabase já nesse formato de e-mail.
const USERNAME_EMAIL_DOMAIN = "painelfx.local";

function usernameToEmail(username: string): string {
  const normalized = username
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
  return `${normalized}@${USERNAME_EMAIL_DOMAIN}`;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!username || !password) {
    return { error: "Informe usuário e senha." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { error: "Usuário ou senha inválidos." };
  }

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
