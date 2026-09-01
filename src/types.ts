import { LucideIcon } from "lucide-react";

export interface Profile {
  name: string;
  handle: string;
  origin: string;
  host: string;
  city: string;
  followers: number;
  following: number;
  bio: string;
}

export interface Post {
  id: string;
  name: string;
  author_id?: string;
  author_name?: string;
  text: string;
  content?: string;
  time: string;
  likes: number;
  liked: boolean;
  comments: number;
  privacy: string;
  following?: boolean;
  saved?: boolean;
  attachment?: string;
  bgTheme?: string;
  feeling?: string;
  location?: string;
  tags: string[];
  reactions?: { emoji: string; count: number }[];
  myReaction?: string;
  commentsData?: any[];
  created_at?: string;
  likes_list?: string[];
}

export interface Goal {
  id: string;
  title: string;
  cat: string;
  icon: LucideIcon;
  steps: Step[];
}

export interface Step {
  t: string;
  d: string;
  done: boolean;
  tool: string;
  links?: { label: string; url: string; type: "video" | "web" | "doc" }[];
}

export interface Theme {
  bg: string;
  card: string;
  card2: string;
  text: string;
  sub: string;
  line: string;
  input: string;
}
