
export interface Country {
  id: string;
  name: string;
  flag: string;
  continent: 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';
  isEnglishSpeaking?: boolean;
}

export enum InfoCategory {
  NEWS = 'Latest Updates',
  DAILY_LOCAL_NEWS = 'Daily Local Briefs',
  LOCAL_NEWS = 'Neighborhood News',
  IMMIGRATION = 'Onboarding Essentials',
  BENEFITS = 'Localization Support',
  JOBS = 'Opportunity Hub',
  COMMUNITY = 'New Local Network',
  HOUSING = 'Home & Settlement'
}

export type PageType = 'onboard' | 'news' | 'visa' | 'safety' | 'network' | 'local' | 'resources' | 'profile' | 'auth' | 'legal' | 'home' | 'roadmaps' | 'create' | 'tasks' | 'me' | 'settings' | 'inbox';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SavedItem {
  id: string;
  type: 'update' | 'resource' | 'portal' | 'safety' | 'journey';
  title: string;
  category?: string;
  data: any;
  timestamp: string;
}

export interface InfoItem {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  date?: string;
  source?: string;
  url?: string;
  category: InfoCategory;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  url: string;
  date: string;
  sourceName: string;
}

export interface UserLocation {
  id?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  displayAddress?: string;
  isManual?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface VisaDetails {
  nationality: string;
  destination: string;
  reason: string;
}

export interface VisaOption {
  title: string;
  icon: string;
  requirements: string[];
  pros: string[];
  cons: string[];
  estimatedTime: string;
}

export interface VisaReport {
  overview: string;
  options: VisaOption[];
  commonPitfalls: string[];
  recommendedSteps: string[];
  officialResourceLinks: GroundingSource[];
  disclaimer: string;
}

export interface SafetyData {
  emergencyNumbers: { service: string; icon: string; number: string; color: string; description?: string }[];
  helplines: { service: string; number: string; description: string; type: string }[];
  generalAdvice: string;
  safeNeighborhoods: string[];
  lawsAndCustoms: { topic: string; rule: string }[];
  healthSafety: { category: string; advice: string }[];
  recentWarnings: string;
  sources: GroundingSource[];
}

export interface NearbyService {
  id?: string;
  name: string;
  address: string;
  rating?: number;
  uri?: string; 
  website?: string; 
  distance?: string;
  phone?: string;
  isVerified?: boolean;
  category?: string;
}

export interface GroupUpdate {
  id: string;
  content: string;
  authorName: string;
  timestamp: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  adminId: string;
  adminName: string;
  members: string[]; 
  updates: GroupUpdate[];
  isJoined?: boolean;
}

export interface FeedPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  tags: string[];
  type: 'update' | 'event' | 'discussion';
  likes: number;
  comments: number;
}

export interface CommunityData {
  groups: CommunityGroup[];
  events: { title: string; date: string; description: string }[];
  sources: GroundingSource[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  savedCountryId?: string;
  notificationsEnabled: boolean;
  savedItems?: SavedItem[];
  savedLocations?: UserLocation[];
  preferredRadius?: number; 
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'update' | 'system' | 'journey';
}
