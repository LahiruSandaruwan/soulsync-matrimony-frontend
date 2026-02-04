export interface SuccessStory {
  id: number;
  couple_user1_id: number;
  couple_user2_id: number | null;
  title: string;
  description: string;
  how_they_met: string | null;
  story_location: string | null;
  marriage_date: string | null;
  cover_photo: string | null;
  photos: SuccessStoryPhoto[];
  status: SuccessStoryStatus;
  featured: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  approved_at: string | null;
  // Relationships
  couple?: {
    user1_name: string;
    user2_name: string | null;
  };
  submitted_by?: {
    id: number;
    name: string;
    email?: string;
  };
  couple_user2?: {
    id: number;
    name: string;
  };
  approved_by?: {
    id: number;
    name: string;
  };
  // Owner-specific fields
  rejection_reason?: string | null;
  can_edit?: boolean;
  is_draft?: boolean;
  is_pending?: boolean;
  is_approved?: boolean;
  is_rejected?: boolean;
  // Admin-specific fields
  admin_notes?: string | null;
  ip_address?: string;
  user_agent?: string;
  couple_info?: Record<string, any>;
}

export type SuccessStoryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface SuccessStoryPhoto {
  id: number;
  url: string;
  thumbnail: string;
  medium: string;
  caption: string | null;
  is_cover: boolean;
}

export interface SuccessStoryCard {
  id: number;
  title: string;
  description: string;
  story_location: string | null;
  marriage_date: string | null;
  cover_photo: string | null;
  featured: boolean;
  view_count: number;
  couple: {
    user1_name: string;
    user2_name: string | null;
  };
  created_at: string;
}

export interface SuccessStorySubmission {
  title: string;
  description: string;
  how_they_met?: string;
  story_location?: string;
  marriage_date?: string;
  couple_user2_id?: number;
  couple_info?: Record<string, any>;
  submit_for_approval?: boolean;
}

export interface SuccessStoryUpdate extends Partial<SuccessStorySubmission> {
  delete_photos?: number[];
}

export interface SuccessStoryListParams {
  page?: number;
  per_page?: number;
  status?: SuccessStoryStatus | 'all';
  featured?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'view_count' | 'featured_at';
  sort_order?: 'asc' | 'desc';
}

export interface SuccessStoryStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  drafts: number;
  total_views: number;
}

export interface UserSearchResult {
  id: number;
  name: string;
}
