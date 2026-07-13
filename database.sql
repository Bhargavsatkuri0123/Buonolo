-- SQL schema and RLS policies for Posts, Likes, Shares, and Saves

-- 1. Create Tables

-- POSTS table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  text text NOT NULL,
  attachment text,
  feeling text,
  location text,
  privacy text DEFAULT 'Public',
  bg_theme text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- POST_TAGS table (for tagged friends/users)
CREATE TABLE post_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  tagged_user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- LIKES/REACTIONS table
CREATE TABLE post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL DEFAULT '👍',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id, emoji)
);

-- COMMENTS table
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SHARES table
CREATE TABLE post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  shared_to_thread_id text, -- nullable if shared externally
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SAVES table
CREATE TABLE post_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- POSTS Policies
-- Anyone can read 'Public' posts, or posts by 'Friends' (if friendship logic implemented)
-- Here we allow viewing all public posts, and user's own posts.
CREATE POLICY "View public posts" ON posts FOR SELECT USING (privacy = 'Public' OR user_id = auth.uid());
CREATE POLICY "Insert own posts" ON posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own posts" ON posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own posts" ON posts FOR DELETE USING (user_id = auth.uid());

-- POST_TAGS Policies
CREATE POLICY "View tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Insert tags for own posts" ON post_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Delete tags for own posts" ON post_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);

-- REACTIONS Policies
CREATE POLICY "View reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Insert own reaction" ON post_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own reaction" ON post_reactions FOR DELETE USING (user_id = auth.uid());

-- COMMENTS Policies
CREATE POLICY "View comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Insert own comment" ON post_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own comment" ON post_comments FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Update own comment" ON post_comments FOR UPDATE USING (user_id = auth.uid());

-- SHARES Policies
CREATE POLICY "View shares" ON post_shares FOR SELECT USING (true);
CREATE POLICY "Insert own share" ON post_shares FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own share" ON post_shares FOR DELETE USING (user_id = auth.uid());

-- SAVES Policies
CREATE POLICY "View own saves" ON post_saves FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert own saves" ON post_saves FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own saves" ON post_saves FOR DELETE USING (user_id = auth.uid());
