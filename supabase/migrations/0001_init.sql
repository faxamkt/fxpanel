-- Grade de Postagens · faxa
-- Schema inicial: clientes, posts, etapas de aprovação, comentários.
-- Acesso admin (equipe faxa) via Supabase Auth (role authenticated).
-- Acesso cliente (link público, sem login) via funções RPC security definer
-- que validam o token_acesso — as tabelas em si ficam fechadas para anon,
-- então o isolamento entre clientes é garantido pelo banco, não só pelo frontend.

create extension if not exists "pgcrypto";

-- ========== TIPOS ==========

create type post_status as enum (
  'Copy V4',
  'Layout V4',
  'Falta material',
  'Em aprovação Cliente',
  'Ajustar',
  'Aprovado para publicação',
  'Publicado'
);

create type post_tipo as enum (
  'Social media',
  'Vídeo',
  'E-mail'
);

create type post_formato as enum (
  'Estático',
  'Carrossel',
  'Reels'
);

create type approval_step_tipo as enum (
  'Temática',
  'Texto',
  'Arte'
);

create type autor_tipo as enum (
  'admin',
  'cliente'
);

-- ========== TABELAS ==========

create table clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  token_acesso uuid not null unique default gen_random_uuid(),
  criado_em timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  titulo text not null,
  tipo post_tipo not null default 'Social media',
  formato post_formato not null default 'Estático',
  data_agendada date not null,
  briefing text not null default '',
  status post_status not null default 'Copy V4',
  link_copy text,
  link_imagem text,
  link_video text,
  link_drive text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index posts_client_id_data_idx on posts (client_id, data_agendada);

create table approval_steps (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  tipo approval_step_tipo not null,
  aprovado boolean not null default false,
  atualizado_em timestamptz not null default now(),
  unique (post_id, tipo)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  autor text not null,
  autor_tipo autor_tipo not null,
  mensagem text not null,
  criado_em timestamptz not null default now()
);

create index comments_post_id_idx on comments (post_id, criado_em);

-- Cria automaticamente as 3 etapas de aprovação (Temática/Texto/Arte) para cada post novo.
create function create_default_approval_steps()
returns trigger
language plpgsql
as $$
begin
  insert into approval_steps (post_id, tipo)
  values (new.id, 'Temática'), (new.id, 'Texto'), (new.id, 'Arte');
  return new;
end;
$$;

create trigger posts_after_insert_approval_steps
  after insert on posts
  for each row execute function create_default_approval_steps();

-- Mantém atualizado_em em dia.
create function set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger posts_set_atualizado_em
  before update on posts
  for each row execute function set_atualizado_em();

create trigger approval_steps_set_atualizado_em
  before update on approval_steps
  for each row execute function set_atualizado_em();

-- ========== RLS ==========

alter table clients enable row level security;
alter table posts enable row level security;
alter table approval_steps enable row level security;
alter table comments enable row level security;

-- Equipe faxa (Supabase Auth) tem acesso total. Não há policy para anon aqui:
-- o acesso do cliente acontece só pelas funções RPC abaixo (security definer),
-- então mesmo com a anon key em mãos, ninguém lê a tabela direto sem o token certo.
create policy "faxa_admin_full_access_clients" on clients
  for all to authenticated using (true) with check (true);

create policy "faxa_admin_full_access_posts" on posts
  for all to authenticated using (true) with check (true);

create policy "faxa_admin_full_access_approval_steps" on approval_steps
  for all to authenticated using (true) with check (true);

create policy "faxa_admin_full_access_comments" on comments
  for all to authenticated using (true) with check (true);

-- ========== FUNÇÕES RPC (acesso do cliente via token) ==========

-- Retorna os dados do cliente dono do token (para header/banner), ou nada se o token for inválido.
create function rpc_client_info(p_token uuid)
returns table (id uuid, nome text, slug text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.nome, c.slug
  from clients c
  where c.token_acesso = p_token;
$$;

-- Retorna os posts do mês (com as etapas de aprovação embutidas) para o cliente dono do token.
create function rpc_client_posts(p_token uuid, p_ano int, p_mes int)
returns table (
  id uuid,
  titulo text,
  tipo post_tipo,
  formato post_formato,
  data_agendada date,
  briefing text,
  status post_status,
  link_copy text,
  link_imagem text,
  link_video text,
  link_drive text,
  approval_steps jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id, p.titulo, p.tipo, p.formato, p.data_agendada, p.briefing, p.status,
    p.link_copy, p.link_imagem, p.link_video, p.link_drive,
    coalesce(
      (select jsonb_agg(jsonb_build_object('id', s.id, 'tipo', s.tipo, 'aprovado', s.aprovado) order by s.tipo)
       from approval_steps s where s.post_id = p.id),
      '[]'::jsonb
    ) as approval_steps
  from posts p
  join clients c on c.id = p.client_id
  where c.token_acesso = p_token
    and extract(year from p.data_agendada) = p_ano
    and extract(month from p.data_agendada) = p_mes
  order by p.data_agendada;
$$;

-- Retorna os comentários de um post, validando que o post pertence ao cliente do token.
create function rpc_client_post_comments(p_token uuid, p_post_id uuid)
returns table (id uuid, autor text, autor_tipo autor_tipo, mensagem text, criado_em timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select cm.id, cm.autor, cm.autor_tipo, cm.mensagem, cm.criado_em
  from comments cm
  join posts p on p.id = cm.post_id
  join clients c on c.id = p.client_id
  where c.token_acesso = p_token
    and cm.post_id = p_post_id
  order by cm.criado_em;
$$;

-- Cliente aprova o post: marca as 3 etapas como aprovadas e o status como "Aprovado para publicação".
create function rpc_client_approve_post(p_token uuid, p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from posts p join clients c on c.id = p.client_id
    where p.id = p_post_id and c.token_acesso = p_token
  ) then
    raise exception 'post não encontrado para este token';
  end if;

  update approval_steps set aprovado = true where post_id = p_post_id;

  update posts set status = 'Aprovado para publicação' where id = p_post_id;
end;
$$;

-- Cliente pede ajuste: muda o status para "Ajustar" e registra o comentário obrigatório.
create function rpc_client_request_adjustment(p_token uuid, p_post_id uuid, p_mensagem text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_client_nome text;
begin
  select c.id, c.nome into v_client_id, v_client_nome
  from posts p join clients c on c.id = p.client_id
  where p.id = p_post_id and c.token_acesso = p_token;

  if v_client_id is null then
    raise exception 'post não encontrado para este token';
  end if;

  if p_mensagem is null or length(trim(p_mensagem)) = 0 then
    raise exception 'mensagem de ajuste é obrigatória';
  end if;

  update posts set status = 'Ajustar' where id = p_post_id;

  insert into comments (post_id, autor, autor_tipo, mensagem)
  values (p_post_id, v_client_nome, 'cliente', p_mensagem);
end;
$$;

revoke all on function rpc_client_info(uuid) from public;
revoke all on function rpc_client_posts(uuid, int, int) from public;
revoke all on function rpc_client_post_comments(uuid, uuid) from public;
revoke all on function rpc_client_approve_post(uuid, uuid) from public;
revoke all on function rpc_client_request_adjustment(uuid, uuid, text) from public;

grant execute on function rpc_client_info(uuid) to anon, authenticated;
grant execute on function rpc_client_posts(uuid, int, int) to anon, authenticated;
grant execute on function rpc_client_post_comments(uuid, uuid) to anon, authenticated;
grant execute on function rpc_client_approve_post(uuid, uuid) to anon, authenticated;
grant execute on function rpc_client_request_adjustment(uuid, uuid, text) to anon, authenticated;

-- ========== SEED (clientes de exemplo, iguais ao protótipo) ==========

insert into clients (nome, slug) values
  ('CPAD | Editora', 'cpad-editora'),
  ('CPAD | Distribuidora', 'cpad-distribuidora'),
  ('Loja da Bel', 'loja-da-bel'),
  ('Master Plastic', 'master-plastic'),
  ('Odorite', 'odorite'),
  ('Prime Ingredientes', 'prime-ingredientes'),
  ('Protect Car', 'protect-car'),
  ('QV Benefícios', 'qv-beneficios');
