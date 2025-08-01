export interface Match {
  id: number;
  user_one_id: number;
  user_two_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  compatibility_score?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  matched_user?: User;
  conversation?: Conversation;
}

export interface MatchSuggestion {
  id: number;
  user: User;
  compatibility_score: number;
  match_reason?: string;
  distance_km?: number;
  common_interests?: string[];
  created_at: string;
}

export interface DailyMatch {
  id: number;
  user: User;
  compatibility_score: number;
  match_reason: string;
  remaining_matches: number;
}

export interface Like {
  id: number;
  user: User;
  liked_at: string;
}

export interface MatchRequest {
  user_id: number;
  action: 'like' | 'super_like' | 'dislike' | 'block';
  message?: string;
}

export interface MatchResponse {
  success: boolean;
  data: {
    match_created?: boolean;
    conversation_id?: number;
    message?: string;
  };
  message: string;
}

export interface MatchFilters {
  age_min?: number;
  age_max?: number;
  location?: string;
  education?: string[];
  religion?: string[];
  marital_status?: string[];
  has_children?: boolean;
  willing_to_relocate?: boolean;
  max_distance_km?: number;
}

export interface MatchSearchRequest {
  query?: string;
  filters?: MatchFilters;
  page?: number;
  per_page?: number;
}

export interface MatchSearchResponse {
  success: boolean;
  data: {
    results: User[];
    total: number;
    pagination: PaginationInfo;
  };
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  current_city: string;
  occupation: string;
  profile_photo?: string;
  compatibility_score?: number;
  is_premium?: boolean;
  is_verified?: boolean;
  last_active?: string;
  distance_km?: number;
  common_interests?: string[];
}

export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  other_user?: User;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'image' | 'voice';
  is_read: boolean;
  created_at: string;
  updated_at: string;
} 