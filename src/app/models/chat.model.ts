export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  created_at: string;
  updated_at: string;
  other_user?: User;
  last_message?: Message;
  unread_count: number;
  is_blocked?: boolean;
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
  sender?: User;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
}

export interface SendMessageRequest {
  content: string;
  type: 'text' | 'image' | 'voice';
  attachment?: File;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message;
  message: string;
}

export interface ConversationResponse {
  success: boolean;
  data: {
    id: number;
    user_one_id: number;
    user_two_id: number;
    other_user: User;
    messages: Message[];
    pagination: PaginationInfo;
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: PaginationInfo;
  };
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  profile_photo?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ChatNotification {
  type: 'message' | 'typing' | 'online' | 'offline';
  conversation_id: number;
  sender_id: number;
  content?: string;
  timestamp: string;
}

export interface TypingIndicator {
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
  timestamp: string;
}

export interface VoiceMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  audio_url: string;
  duration: number;
  is_listened: boolean;
  created_at: string;
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  reaction: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

export interface MessageUpdateRequest {
  content: string;
}

export interface MessageDeleteResponse {
  success: boolean;
  message: string;
}

export interface ConversationBlockRequest {
  reason?: string;
}

export interface ConversationBlockResponse {
  success: boolean;
  message: string;
}

export interface ConversationDeleteResponse {
  success: boolean;
  message: string;
}

export interface MarkAsReadRequest {
  message_ids: number[];
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
} 