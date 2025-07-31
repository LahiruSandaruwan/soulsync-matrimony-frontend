export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  country_code: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  subscription?: Subscription;
  role?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  height_cm?: number;
  weight_kg?: number;
  body_type?: 'slim' | 'average' | 'athletic' | 'heavy';
  complexion?: 'very_fair' | 'fair' | 'wheatish' | 'brown' | 'dark';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  current_city?: string;
  current_state?: string;
  current_country?: string;
  education_level?: 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'phd' | 'other';
  occupation?: string;
  company?: string;
  job_title?: string;
  annual_income_usd?: number;
  religion?: string;
  caste?: string;
  mother_tongue?: string;
  languages_known?: string[];
  family_type?: 'nuclear' | 'joint';
  family_status?: 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';
  diet?: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'jain' | 'occasionally_non_veg';
  smoking?: 'never' | 'occasionally' | 'regularly';
  drinking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  hobbies?: string[];
  about_me?: string;
  looking_for?: string;
  marital_status?: 'never_married' | 'divorced' | 'widowed' | 'separated';
  have_children?: boolean;
  children_count?: number;
  willing_to_relocate?: boolean;
  preferred_locations?: string[];
  completion_percentage?: number;
  photos?: UserPhoto[];
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

export interface UserPreference {
  id: number;
  user_id: number;
  age_min?: number;
  age_max?: number;
  height_min?: number;
  height_max?: number;
  education_level?: string[];
  religion?: string[];
  location_preference?: 'same_city' | 'same_state' | 'same_country' | 'anywhere';
  max_distance_km?: number;
  deal_breakers?: string[];
  preferred_diet?: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: 'free' | 'basic' | 'premium' | 'platinum';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'platinum';
  price_usd: number;
  price_lkr: number;
  duration_months: number;
  features: string[];
  limits: {
    daily_matches?: number;
    messages_per_day?: number;
    photo_uploads?: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  country_code: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
} 