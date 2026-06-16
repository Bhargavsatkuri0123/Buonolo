-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  notifications_enabled boolean default true,
  saved_country_id text,
  saved_items jsonb default '[]'::jsonb,
  saved_locations jsonb default '[]'::jsonb,
  preferred_radius numeric default 10,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- POSTS
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references auth.users on delete cascade not null,
  author_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  likes jsonb default '[]'::jsonb,
  comments_count integer default 0
);

-- GROUPS
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text,
  admin_id uuid references auth.users on delete cascade not null,
  admin_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- GROUP MEMBERS
create table public.group_members (
  group_id uuid references public.groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  user_name text not null,
  primary key (group_id, user_id)
);

-- GROUP UPDATES
create table public.group_updates (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups on delete cascade not null,
  content text not null,
  author_name text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_updates enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile." on public.profiles for insert with check (auth.uid() = id);

-- POSTS POLICIES
create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can create posts." on public.posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts." on public.posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts." on public.posts for delete using (auth.uid() = author_id);

-- GROUPS POLICIES
create policy "Groups viewable by everyone." on public.groups for select using (true);
create policy "Auth users can create groups." on public.groups for insert with check (auth.uid() = admin_id);
create policy "Admin can update group." on public.groups for update using (auth.uid() = admin_id);
create policy "Admin can delete group." on public.groups for delete using (auth.uid() = admin_id);

-- GROUP MEMBERS POLICIES
create policy "Group members viewable by everyone." on public.group_members for select using (true);
create policy "Users can join groups." on public.group_members for insert with check (auth.uid() = user_id);
create policy "Users can leave groups." on public.group_members for delete using (auth.uid() = user_id);

-- GROUP UPDATES POLICIES
create policy "Updates viewable by everyone." on public.group_updates for select using (true);
create policy "Any authenticated user can insert update." on public.group_updates for insert with check (auth.uid() is not null);

-- REALTIME CONFIGURATION
-- Enable realtime updates so the app channels can receive postgres_changes
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table group_updates;

-- FOLLOWS
create table public.follows (
  follower_id uuid references auth.users on delete cascade not null,
  following_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "Follows viewable by everyone." on public.follows for select using (true);
create policy "Users can follow/unfollow." on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can delete own follow." on public.follows for delete using (auth.uid() = follower_id);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users on delete cascade not null,
  receiver_id uuid references auth.users on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.messages enable row level security;
create policy "Users can view own messages." on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages." on public.messages for insert with check (auth.uid() = sender_id);
create policy "Receivers can mark messages as read." on public.messages for update using (auth.uid() = receiver_id);

-- NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications." on public.notifications for select using (auth.uid() = user_id);
create policy "Users can dismiss own notifications." on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications." on public.notifications for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
