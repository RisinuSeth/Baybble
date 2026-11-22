alter table public.baybble_conversations
  add column if not exists is_pinned boolean not null default false;

comment on column public.baybble_conversations.is_pinned
  is 'Whether the owning user has pinned this conversation in Baybble.';
