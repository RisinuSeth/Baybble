insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'baybble-conversation-files',
  'baybble-conversation-files',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.baybble_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.baybble_messages(id) on delete cascade,
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null check (char_length(filename) between 1 and 255),
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  storage_path text not null unique,
  extracted_text text not null check (char_length(extracted_text) <= 50000),
  page_count integer,
  created_at timestamptz not null default now(),
  constraint baybble_attachments_conversation_owner_fk
    foreign key (conversation_id, user_id)
    references public.baybble_conversations(id, user_id)
    on delete cascade
);

create index if not exists baybble_attachments_message_idx
  on public.baybble_attachments(message_id);

create index if not exists baybble_attachments_conversation_idx
  on public.baybble_attachments(conversation_id, created_at);

alter table public.baybble_attachments enable row level security;

create policy "Baybble users read own conversation attachments"
on public.baybble_attachments for select to authenticated
using (user_id = (select auth.uid()));

create policy "Baybble users create own conversation attachments"
on public.baybble_attachments for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.baybble_messages m
    where m.id = message_id
      and m.conversation_id = baybble_attachments.conversation_id
      and m.user_id = (select auth.uid())
      and m.role = 'user'
  )
);

create policy "Baybble users delete own conversation attachments"
on public.baybble_attachments for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Baybble users upload own conversation files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'baybble-conversation-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.baybble_conversations c
    where c.id::text = (storage.foldername(name))[2]
      and c.user_id = (select auth.uid())
  )
);

create policy "Baybble users read own conversation files"
on storage.objects for select to authenticated
using (
  bucket_id = 'baybble-conversation-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.baybble_conversations c
    where c.id::text = (storage.foldername(name))[2]
      and c.user_id = (select auth.uid())
  )
);

create policy "Baybble users delete own conversation files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'baybble-conversation-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.baybble_conversations c
    where c.id::text = (storage.foldername(name))[2]
      and c.user_id = (select auth.uid())
  )
);
