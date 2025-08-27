import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface TypingIndicator {
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
  username: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  created_at: string;
}

export interface MatchNotification {
  user_id: number;
  user_name: string;
  user_photo?: string;
  match_percentage: number;
}

export interface OnlineStatus {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

declare global {
  interface Window {
    Echo: any;
    Pusher: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private echo: any = null;
  private connectionStateSubject = new BehaviorSubject<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  private messageSubject = new BehaviorSubject<WebSocketMessage | null>(null);
  private chatMessageSubject = new BehaviorSubject<ChatMessage | null>(null);
  private typingIndicatorSubject = new BehaviorSubject<TypingIndicator | null>(null);
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  private matchNotificationSubject = new BehaviorSubject<MatchNotification | null>(null);
  private onlineStatusSubject = new BehaviorSubject<OnlineStatus | null>(null);

  // Public observables
  public connectionState$ = this.connectionStateSubject.asObservable();
  public message$ = this.messageSubject.asObservable();
  public chatMessage$ = this.chatMessageSubject.asObservable();
  public typingIndicator$ = this.typingIndicatorSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();
  public matchNotification$ = this.matchNotificationSubject.asObservable();
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = environment.realtime.maxReconnectAttempts;
  private reconnectInterval = environment.realtime.reconnectInterval;

  constructor() {
    this.initializeEcho();
  }

  private initializeEcho(): void {
    if (typeof window !== 'undefined' && window.Echo) {
      this.echo = window.Echo;
    }
  }

  connect(token: string): void {
    if (this.echo) {
      this.connectionStateSubject.next('connecting');
      
      // Configure Echo with authentication
      this.echo.connector.options.auth = {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      };

      this.echo.connector.connect()
        .then(() => {
          this.connectionStateSubject.next('connected');
          this.reconnectAttempts = 0;
        })
        .catch((error: any) => {
          console.error('WebSocket connection failed:', error);
          this.connectionStateSubject.next('error');
          this.scheduleReconnect();
        });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval);
    }
  }

  // Laravel Echo channel helpers
  joinConversation(conversationId: number): void {
    if (!this.echo) return;
    this.echo.private(`chat.${conversationId}`)
      .listen('MessageSent', (e: any) => {
        const msg: ChatMessage = {
          id: e.message.id,
          conversation_id: e.message.conversation_id,
          sender_id: e.message.sender_id,
          content: e.message.content,
          message_type: e.message.type || 'text',
          file_url: e.message.file_url,
          file_name: e.message.file_name,
          is_read: e.message.is_read,
          created_at: e.message.created_at
        };
        this.chatMessageSubject.next(msg);
        this.messageSubject.next({ type: 'message', data: msg, timestamp: new Date().toISOString() });
      })
      .listen('UserTyping', (e: any) => {
        const typing: TypingIndicator = {
          conversation_id: e.conversation_id,
          user_id: e.user_id,
          is_typing: e.typing,
          username: e.username || ''
        };
        this.typingIndicatorSubject.next(typing);
        this.messageSubject.next({ type: 'typing', data: typing, timestamp: new Date().toISOString() });
      });
  }

  leaveConversation(conversationId: number): void {
    if (!this.echo) return;
    try { this.echo.leave(`chat.${conversationId}`); } catch { /* ignore */ }
  }

  subscribeUser(userId: number): void {
    if (!this.echo) return;
    this.echo.private(`user.${userId}`)
      .listen('MatchCreated', (e: any) => {
        this.matchNotificationSubject.next({
          user_id: e.user_id,
          user_name: e.user_name,
          user_photo: e.user_photo,
          match_percentage: e.match?.compatibility_score || 0
        });
        this.messageSubject.next({ type: 'match', data: e, timestamp: new Date().toISOString() });
      })
      .listen('UserStatusChanged', (e: any) => {
        this.onlineStatusSubject.next({ user_id: e.user_id, is_online: e.status === 'online', last_seen: e.last_seen });
      });
    this.echo.private(`notifications.${userId}`)
      .listen('NotificationSent', (e: any) => {
        const n = e.notification || e;
        this.notificationSubject.next(n);
        this.messageSubject.next({ type: 'notification', data: n, timestamp: new Date().toISOString() });
      });
  }

  // Send methods
  sendMessage(_message: any): void { /* use HTTP send or Echo whisper if configured */ }

  sendChatMessage(conversationId: number, content: string, messageType: string = 'text'): void {
    this.sendMessage({
      type: 'chat_message',
      data: {
        conversation_id: conversationId,
        content,
        message_type: messageType
      }
    });
  }

  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    this.sendMessage({
      type: 'typing_indicator',
      data: {
        conversation_id: conversationId,
        is_typing: isTyping
      }
    });
  }

  sendLike(userId: number): void {
    this.sendMessage({
      type: 'like',
      data: {
        user_id: userId
      }
    });
  }

  sendSuperLike(userId: number): void {
    this.sendMessage({
      type: 'super_like',
      data: {
        user_id: userId
      }
    });
  }

  sendDislike(userId: number): void {
    this.sendMessage({
      type: 'dislike',
      data: {
        user_id: userId
      }
    });
  }

  sendBlock(userId: number): void {
    this.sendMessage({
      type: 'block',
      data: {
        user_id: userId
      }
    });
  }

  sendOnlineStatus(isOnline: boolean): void {
    this.sendMessage({
      type: 'online_status',
      data: {
        is_online: isOnline
      }
    });
  }

  // Connection management
  disconnect(): void { if (this.echo) { this.echo.disconnect(); this.echo = null; } }

  reconnect(): void {
    this.reconnectAttempts = 0;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      this.connect(token);
    }
  }

  // Utility methods
  isConnected(): boolean { return !!this.echo; }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.connectionStateSubject.value;
  }

  // Compatibility methods for existing components
  onMessage(): Observable<WebSocketMessage> {
    return this.message$.pipe(
      filter((message): message is WebSocketMessage => message !== null)
    );
  }

  onTyping(): Observable<TypingIndicator> {
    return this.typingIndicator$.pipe(
      filter((typing): typing is TypingIndicator => typing !== null)
    );
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.message$.pipe(
      filter((message): message is WebSocketMessage => message !== null)
    );
  }

  getOnlineStatusUpdates(): Observable<OnlineStatus> {
    return this.onlineStatus$.pipe(
      filter((status): status is OnlineStatus => status !== null)
    );
  }

  sendTyping(conversationId: number, isTyping: boolean): void {
    this.sendTypingIndicator(conversationId, isTyping);
  }

  /**
   * Handle WebSocket service errors
   * @param message User-friendly error message
   * @param error Technical error details
   */
  private handleError(message: string, error: any): void {
    if (!environment.production) {
      console.error(`WebSocket Service Error: ${message}`, error);
    }
    // Could emit to error handling service or show notification
  }
} 