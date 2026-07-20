"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Client } from "@/lib/types";

export async function listClients(): Promise<Client[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").order("nome");
  if (error) throw new Error(error.message);
  return data as Client[];
}

function slugify(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createClient(nome: string): Promise<Client> {
  const supabase = await createServerSupabaseClient();
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome do cliente é obrigatório.");

  const { data, error } = await supabase
    .from("clients")
    .insert({ nome: nomeLimpo, slug: slugify(nomeLimpo) })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return data as Client;
}
