-- Catálogo inversionistas (URLs Shopify; sin Storage de imágenes)
-- Auth: user_roles + RLS

create extension if not exists "pgcrypto";

-- ——— Roles ———
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create policy "user_roles_select_own_or_admin"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_insert_bootstrap"
  on public.user_roles for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'admin'
    and not exists (select 1 from public.user_roles where role = 'admin')
  );

-- ——— Catálogos ———
create table if not exists public.investor_catalogs (
  code text primary key,
  name text not null,
  flag text not null default '',
  slug text not null unique,
  currency text not null check (currency in ('CLP', 'COP', 'USD', 'EUR')),
  locale text not null default 'es',
  title text not null default 'Catálogo Inversionistas',
  button_label text not null default 'Catálogo Inversionistas',
  is_active boolean not null default true,
  empresario_discount numeric not null default 0.30
    check (empresario_discount >= 0 and empresario_discount < 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists investor_catalogs_slug_idx on public.investor_catalogs (slug);
create index if not exists investor_catalogs_active_idx on public.investor_catalogs (is_active);

-- ——— Productos ———
create table if not exists public.investor_products (
  id uuid primary key default gen_random_uuid(),
  catalog_code text not null references public.investor_catalogs (code) on delete cascade,
  handle text not null,
  title text not null,
  sku text not null default '',
  retail_price numeric not null check (retail_price >= 0),
  compare_at_price numeric null check (compare_at_price is null or compare_at_price >= 0),
  mayorista_price numeric not null check (mayorista_price >= 0),
  mayorista_is_provisional boolean not null default true,
  mayorista_match text null
    check (
      mayorista_match is null
      or mayorista_match in (
        'sku', 'name', 'estimate', 'estimate_family', 'fallback', 'manual'
      )
    ),
  image_url text not null default '',
  gallery_urls text[] not null default '{}',
  tags text[] not null default '{}',
  categories text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (catalog_code, handle)
);

create index if not exists investor_products_catalog_idx
  on public.investor_products (catalog_code);
create index if not exists investor_products_active_idx
  on public.investor_products (catalog_code, is_active);
create index if not exists investor_products_sku_idx
  on public.investor_products (catalog_code, sku);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists investor_catalogs_updated_at on public.investor_catalogs;
create trigger investor_catalogs_updated_at
  before update on public.investor_catalogs
  for each row execute function public.set_updated_at();

drop trigger if exists investor_products_updated_at on public.investor_products;
create trigger investor_products_updated_at
  before update on public.investor_products
  for each row execute function public.set_updated_at();

alter table public.investor_catalogs enable row level security;
alter table public.investor_products enable row level security;

-- Lectura pública: catálogos/productos activos
create policy "investor_catalogs_public_read"
  on public.investor_catalogs for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "investor_products_public_read"
  on public.investor_products for select
  to anon, authenticated
  using (
    is_active = true
    or public.is_admin()
  );

-- Writes solo admin
create policy "investor_catalogs_admin_write"
  on public.investor_catalogs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "investor_products_admin_write"
  on public.investor_products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
