import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
  sender?: any;
}

interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
  user1?: any;
  user2?: any;
}

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LoadingSpinnerComponent
  ],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;
  
  private destroy$ = new Subject<void>();
  
  conversationId: number = 0;
  conversation: Conversation | null = null;
  messages: Message[] = [];
  currentUser: any = null;
  otherUser: any = null;
  
  newMessage: string = '';
  loading = true;
  error = '';
  sending = false;
  typing = false;
  isTyping = false;
  typingTimeout: any;
  
  // File upload
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploading = false;
  // Voice recording
  recording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupRouteParams();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.conversationId) {
      this.webSocketService.leaveConversation(this.conversationId);
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private setupRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.conversationId = +params['conversationId'];
        if (this.conversationId) {
          this.loadConversation();
          this.loadMessages();
        }
      });
  }

  private setupWebSocket(): void {
    // Listen for new messages
    this.webSocketService.onMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data.conversation_id === this.conversationId) {
          this.handleNewMessage(data);
        }
      });

    // Listen for typing indicators
    this.webSocketService.onTyping()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data.conversation_id === this.conversationId && data.user_id !== this.currentUser?.id) {
          this.handleTypingIndicator(data);
        }
      });
  }

  public loadConversation(): void {
    this.loading = true;
    this.error = '';

    this.chatService.getConversation(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.conversation = response.data;
          this.otherUser = this.getOtherParticipant(this.conversation!);
          this.loading = false;
          this.webSocketService.joinConversation(this.conversationId);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load conversation';
          this.loading = false;
        }
      });
  }

  private loadMessages(): void {
    this.chatService.getMessages(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.messages = response;
          this.markMessagesAsRead();
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load messages';
        }
      });
  }

  private getOtherParticipant(conversation: Conversation): any {
    if (conversation.user1_id === this.currentUser?.id) {
      return conversation.user2;
    } else {
      return conversation.user1;
    }
  }

  private handleNewMessage(data: any): void {
    const newMessage: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      content: data.content,
      message_type: data.message_type || 'text',
      file_url: data.file_url,
      file_name: data.file_name,
      is_read: false,
      created_at: data.created_at,
      sender: data.sender
    };

    this.messages.push(newMessage);
    this.markMessagesAsRead();
  }

  private handleTypingIndicator(data: any): void {
    this.isTyping = data.typing;
    if (this.isTyping) {
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        this.isTyping = false;
      }, 3000);
    }
  }

  private markMessagesAsRead(): void {
    if (this.conversationId) {
      this.chatService.markConversationAsRead(this.conversationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Messages marked as read
          },
          error: (error: any) => {
            console.error('Failed to mark messages as read:', error);
          }
        });
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Ignore scroll errors
    }
  }

  onSendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) {
      return;
    }
    this.sending = true;
    const messageData = {
      receiver_id: this.otherUser.id,
      content: this.newMessage,
      message_type: this.selectedFile ? 'file' as const : 'text' as const,
      file: this.selectedFile || undefined
    };
    this.chatService.sendMessage({ ...messageData, conversation_id: this.conversationId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.newMessage = '';
          this.selectedFile = null;
          this.uploadProgress = 0;
          this.sending = false;
          this.stopTyping();
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to send message';
          this.sending = false;
        }
      });
  }

  onTyping(): void {
    if (!this.typing) {
      this.typing = true;
      this.webSocketService.sendTyping(this.conversationId, true);
    }

    // Reset typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  private stopTyping(): void {
    this.typing = false;
    this.webSocketService.sendTyping(this.conversationId, false);
  }

  onFileSelect(file: File | null | undefined): void {
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size must be less than 5MB';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'Invalid file type. Allowed: JPG, PNG, GIF, PDF, TXT';
      return;
    }

    this.selectedFile = file;
  }

  onFileInputChange(): void {
    const input = this.fileInput?.nativeElement;
    const file = input?.files && input.files.length > 0 ? input.files[0] : null;
    this.onFileSelect(file);
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        if (this.otherUser?.id) {
          this.chatService.sendVoiceMessage(this.otherUser.id, file).subscribe({
            next: () => {},
            error: (err: any) => this.error = err.message || 'Failed to send voice message'
          });
        }
      };
      this.mediaRecorder.start();
      this.recording = true;
    } catch (e: any) {
      this.error = e.message || 'Microphone access denied';
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.recording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
      this.recording = false;
    }
  }

  onRemoveFile(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onBackToChats(): void {
    this.router.navigate(['/chat']);
  }

  onViewProfile(): void {
    if (this.otherUser) {
      this.router.navigate(['/profile', this.otherUser.id]);
    }
  }

  getMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isMyMessage(message: Message): boolean {
    return message.sender_id === this.currentUser?.id;
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'txt': return '📝';
      default: return '📎';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.png';
    }
  }

  trackByMessageId(index: number, message: Message): number {
    return message.id;
  }
}
