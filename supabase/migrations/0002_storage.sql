-- Bucket público pra assets de post (copy, imagem/capa, vídeo).
-- Público em LEITURA (o link do cliente e a miniatura no calendário precisam
-- abrir a imagem sem login); só a equipe autenticada pode enviar/trocar/apagar.

insert into storage.buckets (id, name, public)
values ('post-assets', 'post-assets', true)
on conflict (id) do nothing;

create policy "faxa_admin_upload_post_assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-assets');

create policy "faxa_admin_update_post_assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'post-assets');

create policy "faxa_admin_delete_post_assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-assets');

create policy "public_read_post_assets" on storage.objects
  for select
  using (bucket_id = 'post-assets');
