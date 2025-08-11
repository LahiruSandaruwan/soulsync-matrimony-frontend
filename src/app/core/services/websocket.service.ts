import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'notification' | 'match' | 'like' | 'online_status' | 'error';
  data: any;
  timestamp: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'file';
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
  type: 'match' | 'like' | 'message' | 'super_like' | 'profile_view';
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export interface MatchNotification {
  user_id: number;
  user_name: string;
  user_photo: string;
  match_percentage: number;
}

export interface OnlineStatus {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  // Placeholder for Echo instance type to avoid direct dependency
  private echo: any | null = null;

  // Connection state
  private connectionStateSubject = new BehaviorSubject<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  public connectionState$ = this.connectionStateSubject.asObservable();

  // Message streams
  private messageSubject = new Subject<WebSocketMessage>();
  public message$ = this.messageSubject.asObservable();

  // Specific message type streams
  private chatMessageSubject = new Subject<ChatMessage>();
  public chatMessage$ = this.chatMessageSubject.asObservable();

  private typingIndicatorSubject = new Subject<TypingIndicator>();
  public typingIndicator$ = this.typingIndicatorSubject.asObservable();

  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  private matchNotificationSubject = new Subject<MatchNotification>();
  public matchNotification$ = this.matchNotificationSubject.asObservable();

  private onlineStatusSubject = new Subject<OnlineStatus>();
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor() {}

  connect(token: string): void {
    if (this.echo) return;
    this.connectionStateSubject.next('connecting');
    import('laravel-echo').then(({ default: Echo }) => {
      const Pusher = (window as any).Pusher || require('pusher-js');
      this.echo = new Echo({
        broadcaster: 'pusher',
        key: (window as any).PUSHER_APP_KEY || 'local',
        cluster: (window as any).PUSHER_APP_CLUSTER || 'mt1',
        wsHost: (window as any).WEBSOCKET_HOST || '127.0.0.1',
        wsPort: (window as any).WEBSOCKET_PORT || 6001,
        forceTLS: false,
        disableStats: true,
        authorizer: (channel: any) => ({
          authorize: (socketId: string, callback: any) => {
            fetch(`${environment.apiUrl.replace('/api/v1','')}/broadcasting/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ channel_name: channel.name, socket_id: socketId })
            }).then(r => r.json()).then(data => callback(false, data)).catch(err => callback(true, err));
          }
        })
      });
      this.connectionStateSubject.next('connected');
    }).catch(err => {
      console.error('Echo load error:', err);
      this.connectionStateSubject.next('error');
    });
  }

  private scheduleReconnect(): void { /* handled by Echo/Pusher */ }

  private handleMessage(message: WebSocketMessage): void {
    this.messageSubject.next(message);

    switch (message.type) {
      case 'message':
        this.chatMessageSubject.next(message.data as ChatMessage);
        break;
      case 'typing':
        this.typingIndicatorSubject.next(message.data as TypingIndicator);
        break;
      case 'notification':
        this.notificationSubject.next(message.data as Notification);
        break;
      case 'match':
        this.matchNotificationSubject.next(message.data as MatchNotification);
        break;
      case 'online_status':
        this.onlineStatusSubject.next(message.data as OnlineStatus);
        break;
      case 'error':
        console.error('WebSocket error message:', message.data);
        break;
    }
  }

  // Laravel Echo channel helpers
  joinConversation(conversationId: number): void {
    if (!this.echo) return;
    const channelName = `private-chat.${conversationId}`;
    this.echo.private(channelName)
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
    const channelName = `private-chat.${conversationId}`;
    try { this.echo.leave(channelName); } catch { /* ignore */ }
  }

  subscribeUser(userId: number): void {
    if (!this.echo) return;
    const userChannel = `private-user.${userId}`;
    const notifChannel = `private-notifications.${userId}`;
    this.echo.private(userChannel)
      .listen('MatchCreated', (e: any) => {
        this.matchNotificationSubject.next({
          user_id: e.user_id,
          user_name: e.user_name,
          user_photo: e.user_photo,
          match_percentage: e.match?.compatibility_score || 0
        });
      })
      .listen('UserStatusChanged', (e: any) => {
        this.onlineStatusSubject.next({ user_id: e.user_id, is_online: e.status === 'online', last_seen: e.last_seen });
      });
    this.echo.private(notifChannel)
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

  sendLike(userId: number, isSuperLike: boolean = false): void {
    this.sendMessage({
      type: 'like',
      data: {
        user_id: userId,
        is_super_like: isSuperLike
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

  // Join/Leave conversation rooms
  joinConversation(conversationId: number): void {
    this.sendMessage({
      type: 'join_conversation',
      data: {
        conversation_id: conversationId
      }
    });
  }

  leaveConversation(conversationId: number): void {
    this.sendMessage({
      type: 'leave_conversation',
      data: {
        conversation_id: conversationId
      }
    });
  }

  // Connection management
  disconnect(): void { if (this.echo) { this.echo.disconnect(); this.echo = null; } }

  reconnect(): void {
    this.shouldReconnect = true;
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
    return this.message$;
  }

  onTyping(): Observable<TypingIndicator> {
    return this.typingIndicator$;
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.message$;
  }

  getOnlineStatusUpdates(): Observable<OnlineStatus> {
    return this.onlineStatus$;
  }

  sendTyping(conversationId: number, isTyping: boolean): void {
    this.sendTypingIndicator(conversationId, isTyping);
  }
} 