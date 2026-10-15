-- Progress photos (spec T-022b). The record says who, when and which pose;
-- the picture is a file in a private storage bucket at <user id>/<photo id>.jpg.
create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  taken_on date not null,
  pose text not null check (pose in ('front', 'side', 'back')),
  path text not null unique check (path like user_id::text || '/%'),
  created_at timestamptz not null default now(),
  -- One photo per pose per day; also the index for listing newest first.
  unique (user_id, taken_on, pose)
);

alter table public.progress_photos enable row level security;

create policy "read" on public.progress_photos for select to authenticated using (public.can_see(user_id));
create policy "write own" on public.progress_photos for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Supabase grants this by default; stated so the schema is self-contained.
grant select, insert, delete on public.progress_photos to authenticated;

-- Private bucket: never public, pictures only, up to 3 MB (the app sends far less).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', false, 3145728, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Files go only in your own folder.
create policy "progress photos: add own" on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress photos: remove own" on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
-- The person reads their own folder (a delete needs this too). Anyone else,
-- like their active coach, reads a file only through a record they can see.
create policy "progress photos: read" on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.progress_photos p where p.path = storage.objects.name and public.can_see(p.user_id))
  ));
