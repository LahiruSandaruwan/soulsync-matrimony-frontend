import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VideoCallService } from '../../core/services/video-call.service';
import { VideoCall } from '../../core/models/video-call.model';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-call-container">
      <div class="video-grid">
        <div class="local-video">
          <video #localVideo autoplay muted playsinline></video>
          <div class="video-label">You</div>
        </div>
        <div class="remote-video">
          <video #remoteVideo autoplay playsinline></video>
          <div class="video-label">{{ remoteUserName }}</div>
        </div>
      </div>
      
      <div class="call-controls">
        <button 
          class="control-btn mute-btn" 
          [class.active]="isMuted"
          (click)="toggleMute()"
          [attr.aria-label]="isMuted ? 'Unmute' : 'Mute'">
          <i class="fas" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
        </button>
        
        <button 
          class="control-btn video-btn" 
          [class.active]="!isVideoEnabled"
          (click)="toggleVideo()"
          [attr.aria-label]="isVideoEnabled ? 'Turn off video' : 'Turn on video'">
          <i class="fas" [class.fa-video]="isVideoEnabled" [class.fa-video-slash]="!isVideoEnabled"></i>
        </button>
        
        <button 
          class="control-btn end-call-btn"
          (click)="endCall()"
          aria-label="End call">
          <i class="fas fa-phone-slash"></i>
        </button>
      </div>
      
      <div class="call-info">
        <div class="call-status">{{ callStatus }}</div>
        <div class="call-duration" *ngIf="callDuration">{{ callDuration }}</div>
      </div>
    </div>
  `,
  styles: [`
    .video-call-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }
    
    .video-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
    }
    
    .local-video,
    .remote-video {
      position: relative;
      background: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
    }
    
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-label {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
    }
    
    .call-controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      background: rgba(0, 0, 0, 0.8);
    }
    
    .control-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .mute-btn,
    .video-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .mute-btn:hover,
    .video-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .mute-btn.active,
    .video-btn.active {
      background: #dc3545;
    }
    
    .end-call-btn {
      background: #dc3545;
      color: white;
    }
    
    .end-call-btn:hover {
      background: #c82333;
    }
    
    .call-info {
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 1rem 2rem;
      border-radius: 25px;
      text-align: center;
    }
    
    .call-status {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .call-duration {
      font-size: 0.875rem;
      opacity: 0.8;
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;

  callId: string = '';
  callStatus: string = 'Connecting...';
  callDuration: string = '';
  remoteUserName: string = 'Remote User';
  isMuted: boolean = false;
  isVideoEnabled: boolean = true;
  
  private destroy$ = new Subject<void>();
  private callStartTime: Date | null = null;
  private durationInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoCallService: VideoCallService
  ) {}

  ngOnInit(): void {
    this.callId = this.route.snapshot.params['callId'];
    this.initializeCall();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupCall();
  }

  private async initializeCall(): Promise<void> {
    try {
      // Get call details
      const call = await this.videoCallService.getCallDetails(parseInt(this.callId)).toPromise();
      if (call) {
        this.remoteUserName = call.remote_user?.name || 'Remote User';
        this.callStatus = 'Connected';
        this.startCallTimer();
        this.initializeWebRTC();
      }
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.callStatus = 'Failed to connect';
      setTimeout(() => this.router.navigate(['/chat']), 3000);
    }
  }

  private async initializeWebRTC(): Promise<void> {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      this.localVideo.nativeElement.srcObject = stream;
      
      // Initialize WebRTC connection
      // This would typically involve signaling through the video call service
      // For now, we'll just show the local video
      
    } catch (error) {
      console.error('Failed to access media devices:', error);
      this.callStatus = 'Camera/Microphone access denied';
    }
  }

  private startCallTimer(): void {
    this.callStartTime = new Date();
    this.durationInterval = setInterval(() => {
      if (this.callStartTime) {
        const duration = Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
        this.callDuration = this.formatDuration(duration);
      }
    }, 1000);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    // Implement actual mute functionality
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
  }

  toggleVideo(): void {
    this.isVideoEnabled = !this.isVideoEnabled;
    // Implement actual video toggle functionality
    const stream = this.localVideo.nativeElement.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = this.isVideoEnabled;
      });
    }
  }

  async endCall(): Promise<void> {
    try {
      await this.videoCallService.endCall(parseInt(this.callId)).toPromise();
      this.cleanupCall();
      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Failed to end call:', error);
      this.cleanupCall();
      this.router.navigate(['/chat']);
    }
  }

  private cleanupCall(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }
    
    // Stop all tracks
    const localStream = this.localVideo.nativeElement.srcObject as MediaStream;
    const remoteStream = this.remoteVideo.nativeElement.srcObject as MediaStream;
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
  }
}
