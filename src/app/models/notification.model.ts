export interface Notification {
  id: number;
  user_id: number;
  type: 'match' | 'message' | 'profile_view' | 'subscription' | 'system' | 'like' | 'super_like' | 'photo_approved' | 'photo_rejected';
  title: string;
  message: string;
  data?: NotificationData;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  action_url?: string;
  priority?: 'low' | 'medium' | 'high';
  expires_at?: string;
}

export interface NotificationData {
  match_id?: number;
  user_id?: number;
  conversation_id?: number;
  message_id?: number;
  subscription_id?: number;
  photo_id?: number;
  [key: string]: any;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: PaginationInfo;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: Notification;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
}

export interface BatchMarkAsReadRequest {
  notification_ids: number[];
}

export interface BatchMarkAsReadResponse {
  success: boolean;
  message: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

export interface CleanupNotificationsResponse {
  success: boolean;
  message: string;
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  read_status?: 'all' | 'read' | 'unread';
  priority?: 'low' | 'medium' | 'high';
  date_from?: string;
  date_to?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    matches: boolean;
    messages: boolean;
    profile_views: boolean;
    likes: boolean;
    super_likes: boolean;
    subscriptions: boolean;
    system: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
}

export interface UpdateNotificationSettingsRequest {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  notification_types?: {
    matches?: boolean;
    messages?: boolean;
    profile_views?: boolean;
    likes?: boolean;
    super_likes?: boolean;
    subscriptions?: boolean;
    system?: boolean;
  };
  quiet_hours?: {
    enabled?: boolean;
    start_time?: string;
    end_time?: string;
  };
}

export interface NotificationSettingsResponse {
  success: boolean;
  data: NotificationSettings;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
  expires_in_hours?: number;
}

export interface CreateNotificationRequest {
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  action_url?: string;
  priority?: 'low' | 'medium' | 'high';
  expires_in_hours?: number;
}

export interface CreateNotificationResponse {
  success: boolean;
  data: Notification;
  message: string;
} 