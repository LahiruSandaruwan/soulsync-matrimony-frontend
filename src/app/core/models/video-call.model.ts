import { User } from './user.model';

export interface VideoCall {
  id: number;
  caller_id: number;
  callee_id: number;
  conversation_id?: number;
  call_id: string;
  room_id?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended' | 'missed';
  initiated_at: string;
  accepted_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  end_reason?: 'normal' | 'network_issue' | 'technical_issue' | 'user_ended' | 'timeout';
  quality_rating?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  caller?: User;
  callee?: User;
  
  // Computed properties
  duration_formatted?: string;
  is_ongoing?: boolean;
  was_successful?: boolean;
}

export interface VideoCallInitiateRequest {
  callee_id: number;
  conversation_id?: number;
}

export interface VideoCallEndRequest {
  reason?: 'normal' | 'network_issue' | 'technical_issue' | 'user_ended';
}

export interface VideoCallTokens {
  caller_token?: string;
  callee_token?: string;
  room_id: string;
}

export interface VideoCallListResponse {
  calls: VideoCall[];
  pagination: {
    current_page: number;
    total_calls: number;
    has_more: boolean;
  };
}

export interface VideoCallStatus {
  PENDING: 'pending';
  ACCEPTED: 'accepted';
  REJECTED: 'rejected';
  ENDED: 'ended';
  MISSED: 'missed';
}

export const VIDEO_CALL_STATUS: VideoCallStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ENDED: 'ended',
  MISSED: 'missed'
};

export interface VideoCallConfig {
  maxCallDuration: number; // in seconds
  callTimeout: number; // time before call expires
  autoEndOnNetworkIssue: boolean;
  enableRecording: boolean;
  videoQuality: 'low' | 'medium' | 'high';
  audioQuality: 'low' | 'medium' | 'high';
}

export interface VideoCallNotification {
  type: 'video_call_incoming' | 'video_call_accepted' | 'video_call_rejected' | 'video_call_ended';
  title: string;
  body: string;
  data: {
    call_id: number;
    caller_id?: number;
    caller_name?: string;
    callee_id?: number;
    room_id?: string;
    status?: string;
    duration_seconds?: number;
    end_reason?: string;
  };
}
