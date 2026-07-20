"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Comment, NewPostInput, Post, UpdatePostInput } from "@/lib/types";

export async function getAdminPosts(
  clientId: string,
  year: number,
  month: number
): Promise<Post[]> {
  const supabase = await createServerSupabaseClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("posts")
    .select("*, approval_steps(*)")
    .eq("client_id", clientId)
    .gte("data_agendada", start)
    .lte("data_agendada", end)
    .order("data_agendada");

  if (error) throw new Error(error.message);
  return data as Post[];
}

export async function createPost(input: NewPostInput): Promise<Post> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .insert(input)
    .select("*, approval_steps(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return data as Post;
}

export async function updatePost(input: UpdatePostInput): Promise<Post> {
  const supabase = await createServerSupabaseClient();
  const { id, ...rest } = input;
  const { data, error } = await supabase
    .from("posts")
    .update(rest)
    .eq("id", id)
    .select("*, approval_steps(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleApprovalStep(stepId: string, aprovado: boolean): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("approval_steps")
    .update({ aprovado })
    .eq("id", stepId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("criado_em");
  if (error) throw new Error(error.message);
  return data as Comment[];
}

export async function addAdminComment(postId: string, autor: string, mensagem: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const mensagemLimpa = mensagem.trim();
  if (!mensagemLimpa) throw new Error("Mensagem vazia.");

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    autor,
    autor_tipo: "admin",
    mensagem: mensagemLimpa,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
