-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workspaces
create table public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  icon        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Folders
create table public.folders (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_id    uuid references public.folders(id) on delete cascade,
  name         text not null,
  icon         text,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Notes
create table public.notes (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  folder_id     uuid references public.folders(id) on delete set null,
  title         text not null default 'Untitled',
  content       jsonb,
  content_text  text,
  icon          text,
  cover         text,
  is_published  boolean not null default false,
  is_archived   boolean not null default false,
  position      integer not null default 0,
  created_by    uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Workspace members
create table public.workspace_members (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('owner', 'editor', 'viewer')) default 'editor',
  created_at   timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- Indexes
create index idx_notes_workspace on public.notes(workspace_id);
create index idx_notes_folder on public.notes(folder_id);
create index idx_notes_archived on public.notes(is_archived);
create index idx_folders_workspace on public.folders(workspace_id);
create index idx_folders_parent on public.folders(parent_id);
create index idx_workspace_members_user on public.workspace_members(user_id);

-- Updated_at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.workspaces
  for each row execute function handle_updated_at();
create trigger set_updated_at before update on public.folders
  for each row execute function handle_updated_at();
create trigger set_updated_at before update on public.notes
  for each row execute function handle_updated_at();

-- RLS
alter table public.workspaces enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.workspace_members enable row level security;

-- Workspace policies
create policy "Members can view workspace"
  on public.workspaces for select
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.workspace_members
      where workspace_id = workspaces.id and user_id = auth.uid()
    )
  );

create policy "Owner can update workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "User can create workspace"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "Owner can delete workspace"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- Notes policies
create policy "Members can view notes"
  on public.notes for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = notes.workspace_id and user_id = auth.uid()
    ) or
    exists (
      select 1 from public.workspaces
      where id = notes.workspace_id and owner_id = auth.uid()
    )
  );

create policy "Editors and owners can create notes"
  on public.notes for insert
  with check (
    created_by = auth.uid() and (
      exists (
        select 1 from public.workspace_members
        where workspace_id = notes.workspace_id and user_id = auth.uid()
        and role in ('owner', 'editor')
      ) or
      exists (
        select 1 from public.workspaces
        where id = notes.workspace_id and owner_id = auth.uid()
      )
    )
  );

create policy "Editors and owners can update notes"
  on public.notes for update
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = notes.workspace_id and user_id = auth.uid()
      and role in ('owner', 'editor')
    ) or
    exists (
      select 1 from public.workspaces
      where id = notes.workspace_id and owner_id = auth.uid()
    )
  );

create policy "Editors and owners can delete notes"
  on public.notes for delete
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = notes.workspace_id and user_id = auth.uid()
      and role in ('owner', 'editor')
    ) or
    exists (
      select 1 from public.workspaces
      where id = notes.workspace_id and owner_id = auth.uid()
    )
  );

-- Folders policies (mirror notes)
create policy "Members can view folders"
  on public.folders for select
  using (
    exists (
      select 1 from public.workspaces
      where id = folders.workspace_id and (
        owner_id = auth.uid() or
        exists (select 1 from public.workspace_members where workspace_id = folders.workspace_id and user_id = auth.uid())
      )
    )
  );

create policy "Editors can manage folders"
  on public.folders for all
  using (
    exists (
      select 1 from public.workspaces
      where id = folders.workspace_id and (
        owner_id = auth.uid() or
        exists (select 1 from public.workspace_members where workspace_id = folders.workspace_id and user_id = auth.uid() and role in ('owner','editor'))
      )
    )
  );

-- Workspace members policies
create policy "Members can view members"
  on public.workspace_members for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.workspaces
      where id = workspace_members.workspace_id and owner_id = auth.uid()
    )
  );

create policy "Owner can manage members"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspaces
      where id = workspace_members.workspace_id and owner_id = auth.uid()
    )
  );

-- Auto-add workspace owner as member
create or replace function add_workspace_owner_as_member()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function add_workspace_owner_as_member();