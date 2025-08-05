export interface Match {
  id: number;
  user: User;
  compatibility_score: number;
  distance_km?: number;
  matching_factors: string[];
  mutual_interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface MatchSuggestion {
  id: number;
  user: User;
  compatibility_score: number;
  distance_km?: number;
  matching_factors: string[];
  mutual_interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface MatchFilters {
  age_min: number;
  age_max: number;
  distance_max: number;
  gender: string;
  religion: string[];
  education_level: string[];
  location_preference: string;
  marital_status?: string[];
  occupation?: string[];
  family_type?: string[];
  diet?: string[];
  smoking?: string[];
  drinking?: string[];
  height_min?: number;
  height_max?: number;
  income_min?: number;
  income_max?: number;
}

export interface MatchStats {
  totalSuggestions: number;
  totalLikes: number;
  totalDislikes: number;
  totalSuperLikes: number;
  totalMatches: number;
  responseRate: number;
  averageCompatibility: number;
  viewedToday?: number;
  likesSent?: number;
  superLikesSent?: number;
}

export interface MatchAction {
  type: 'like' | 'dislike' | 'super_like' | 'block';
  userId: number;
  timestamp: string;
}

export interface MatchResponse {
  success: boolean;
  data: Match | MatchSuggestion | MatchSuggestion[];
  message: string;
  stats?: MatchStats;
}

export interface MatchRequest {
  filters?: MatchFilters;
  page?: number;
  limit?: number;
  sort_by?: 'compatibility' | 'distance' | 'recent';
  sort_order?: 'asc' | 'desc';
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country_code: string;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  photos?: UserPhoto[];
  age?: number;
}

export interface UserProfile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  country_code?: string;
  height_cm?: number;
  weight_kg?: number;
  body_type?: string;
  complexion?: string;
  blood_group?: string;
  current_city?: string;
  current_state?: string;
  current_country?: string;
  education_level?: string;
  occupation?: string;
  company?: string;
  job_title?: string;
  annual_income_usd?: number;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  languages_known?: string[];
  family_type?: string;
  family_status?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string[];
  about_me?: string;
  looking_for?: string;
  marital_status?: string;
  have_children?: boolean;
  children_count?: number;
  willing_to_relocate?: boolean;
  preferred_locations?: string[];
  primary_photo?: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface UserPhoto {
  id: number;
  user_id: number;
  file_path: string;
  is_primary: boolean;
  is_private: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
} 