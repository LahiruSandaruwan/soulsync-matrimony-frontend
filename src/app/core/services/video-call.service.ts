import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, fromEvent } from 'rxjs';
import { map, catchError, tap, filter } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { WebSocketService } from './websocket.service';
import { environment } from '../../../environments/environment';
import { 
  VideoCall, 
  VideoCallInitiateRequest, 
  VideoCallEndRequest, 
  VideoCallTokens, 
  VideoCallListResponse,
  VideoCallNotification,
  VIDEO_CALL_STATUS
} from '../models/video-call.model';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private activeCallSubject = new BehaviorSubject<VideoCall | null>(null);
  public activeCall$ = this.activeCallSubject.asObservable();

  private callHistorySubject = new BehaviorSubject<VideoCall[]>([]);
  public callHistory$ = this.callHistorySubject.asObservable();

  private isInCallSubject = new BehaviorSubject<boolean>(false);
  public isInCall$ = this.isInCallSubject.asObservable();

  private incomingCallSubject = new BehaviorSubject<VideoCall | null>(null);
  public incomingCall$ = this.incomingCallSubject.asObservable();

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(
    private apiService: ApiService,
    private webSocketService: WebSocketService
  ) {
    this.setupWebSocketListeners();
  }

  /**
   * Setup WebSocket listeners for real-time call events
   */
  private setupWebSocketListeners(): void {
    // Listen for incoming call notifications
    this.webSocketService.message$.subscribe((message: any) => {
      if (message.type === 'video_call_incoming') {
        this.handleIncomingCall(message.data);
      } else if (message.type === 'video_call_status_changed') {
        this.handleCallStatusChange(message.data);
      } else if (message.type === 'video_call_ended') {
        this.handleCallEnded(message.data);
      }
    });
  }

  /**
   * Get video call history
   */
  getCallHistory(page: number = 1, limit: number = 20, status?: string): Observable<VideoCallListResponse> {
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }

    return this.apiService.get<VideoCallListResponse>('/video-calls', params)
      .pipe(
        map(response => {
          if (response.success) {
            this.callHistorySubject.next(response.data.calls);
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to load call history', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Initiate a video call
   */
  initiateCall(request: VideoCallInitiateRequest): Observable<{ call: VideoCall; tokens: VideoCallTokens }> {
    return this.apiService.post<any>('/video-calls/initiate', request)
      .pipe(
        map(response => {
          if (response.success) {
            const call = response.data.call;
            const tokens = {
              caller_token: response.data.caller_token,
              room_id: response.data.room_id
            };
            
            this.activeCallSubject.next(call);
            this.isInCallSubject.next(true);
            
            return { call, tokens };
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to initiate video call', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Accept an incoming video call
   */
  acceptCall(callId: number): Observable<{ call: VideoCall; tokens: VideoCallTokens }> {
    return this.apiService.post<any>(`/video-calls/${callId}/accept`)
      .pipe(
        map(response => {
          if (response.success) {
            const call = response.data.call;
            const tokens = {
              callee_token: response.data.callee_token,
              room_id: response.data.room_id
            };
            
            this.activeCallSubject.next(call);
            this.isInCallSubject.next(true);
            this.incomingCallSubject.next(null); // Clear incoming call
            
            return { call, tokens };
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to accept video call', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Reject an incoming video call
   */
  rejectCall(callId: number): Observable<void> {
    return this.apiService.post<void>(`/video-calls/${callId}/reject`)
      .pipe(
        map(response => {
          if (response.success) {
            this.incomingCallSubject.next(null); // Clear incoming call
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to reject video call', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * End an active video call
   */
  endCall(callId: number, request?: VideoCallEndRequest): Observable<VideoCall> {
    return this.apiService.post<any>(`/video-calls/${callId}/end`, request || {})
      .pipe(
        map(response => {
          if (response.success) {
            const call = response.data.call;
            
            this.activeCallSubject.next(null);
            this.isInCallSubject.next(false);
            this.incomingCallSubject.next(null);
            
            // Clean up WebRTC resources
            this.cleanupWebRTC();
            
            return call;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to end video call', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get call details
   */
  getCallDetails(callId: number): Observable<VideoCall> {
    return this.apiService.get<VideoCall>(`/video-calls/${callId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(error => {
          this.handleError('Failed to get call details', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Setup local media stream (camera and microphone)
   */
  async setupLocalMedia(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    try {
      const constraints = {
        video: videoEnabled ? {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'user'
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      this.handleError('Failed to access camera/microphone', error);
      throw error;
    }
  }

  /**
   * Setup WebRTC peer connection
   */
  async setupPeerConnection(isInitiator: boolean = false): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
        // Add TURN servers for production use
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to other peer via signaling server
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    return this.peerConnection;
  }

  /**
   * Create and send offer (for call initiator)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not established');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // Send offer to other peer via signaling server
    this.sendSignalingMessage({
      type: 'offer',
      sdp: offer
    });

    return offer;
  }

  /**
   * Create and send answer (for call receiver)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not established');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // Send answer to other peer via signaling server
    this.sendSignalingMessage({
      type: 'answer',
      sdp: answer
    });

    return answer;
  }

  /**
   * Handle received answer (for call initiator)
   */
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not established');
    }

    await this.peerConnection.setRemoteDescription(answer);
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not established');
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Get local media stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote media stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Clean up WebRTC resources
   */
  private cleanupWebRTC(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
  }

  /**
   * Send signaling message (would integrate with WebSocket service)
   */
  private sendSignalingMessage(message: any): void {
    // This would send the message via WebSocket to the other peer
    // Using the message$ observable pattern instead of direct send method
    this.webSocketService.sendMessage({
      type: 'video_call_signaling',
      data: message
    });
  }

  /**
   * Handle incoming call notification
   */
  private handleIncomingCall(notification: VideoCallNotification): void {
    const incomingCall: VideoCall = {
      id: notification.data.call_id,
      caller_id: notification.data.caller_id!,
      callee_id: 0, // Will be filled by current user
      call_id: '',
      status: VIDEO_CALL_STATUS.PENDING,
      initiated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      caller: {
        id: notification.data.caller_id!,
        first_name: notification.data.caller_name?.split(' ')[0] || '',
        last_name: notification.data.caller_name?.split(' ')[1] || '',
        email: '',
        date_of_birth: '',
        gender: 'male',
        country_code: '',
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    this.incomingCallSubject.next(incomingCall);
  }

  /**
   * Handle call status changes
   */
  private handleCallStatusChange(notification: VideoCallNotification): void {
    const activeCall = this.activeCallSubject.value;
    if (activeCall && activeCall.id === notification.data.call_id) {
      activeCall.status = notification.data.status as any;
      this.activeCallSubject.next(activeCall);
    }
  }

  /**
   * Handle call ended notification
   */
  private handleCallEnded(notification: VideoCallNotification): void {
    this.activeCallSubject.next(null);
    this.isInCallSubject.next(false);
    this.incomingCallSubject.next(null);
    this.cleanupWebRTC();
  }

  /**
   * Handle service errors
   */
  private handleError(message: string, error: any): void {
    if (!environment.production) {
      console.error(`Video Call Service Error: ${message}`, error);
    }
  }

  /**
   * Clear all call state (useful for logout)
   */
  clearState(): void {
    this.activeCallSubject.next(null);
    this.isInCallSubject.next(false);
    this.incomingCallSubject.next(null);
    this.callHistorySubject.next([]);
    this.cleanupWebRTC();
  }
}
