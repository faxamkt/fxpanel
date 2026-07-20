"use server";

import { revalidatePath } from "next/cache";
import { createAnonSupabaseClient } from "@/lib/supabase/server";
import { Client, ClientPost, Comment } from "@/lib/types";

type ClientInfo = Pick<Client, "id" | "nome" | "slug">;

export async function getClientInfo(token: string): Promise<ClientInfo | null> {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase.rpc("rpc_client_info", { p_token: token });
  if (error) throw new Error(error.message);
  return (data?.[0] as ClientInfo) ?? null;
}

export async function getClientPosts(
  token: string,
  year: number,
  month: number
): Promise<ClientPost[]> {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase.rpc("rpc_client_posts", {
    p_token: token,
    p_ano: year,
    p_mes: month,
  });
  if (error) throw new Error(error.message);
  return (data as ClientPost[]) ?? [];
}

export async function getClientPostComments(token: string, postId: string): Promise<Comment[]> {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase.rpc("rpc_client_post_comments", {
    p_token: token,
    p_post_id: postId,
  });
  if (error) throw new Error(error.message);
  return (data as Comment[]) ?? [];
}

export async function approvePost(token: string, postId: string): Promise<void> {
  const supabase = createAnonSupabaseClient();
  const { error } = await supabase.rpc("rpc_client_approve_post", {
    p_token: token,
    p_post_id: postId,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/cliente/${token}`);
}

export async function requestAdjustment(
  token: string,
  postId: string,
  mensagem: string
): Promise<void> {
  const supabase = createAnonSupabaseClient();
  const { error } = await supabase.rpc("rpc_client_request_adjustment", {
    p_token: token,
    p_post_id: postId,
    p_mensagem: mensagem,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/cliente/${token}`);
}
