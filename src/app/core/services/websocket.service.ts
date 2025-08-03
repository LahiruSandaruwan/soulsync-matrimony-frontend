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
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private shouldReconnect = true;

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
    if (this.isConnecting || this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.connectionStateSubject.next('connecting');

    const wsUrl = environment.wsUrl || environment.apiUrl.replace('http', 'ws');
    this.socket = new WebSocket(`${wsUrl}/ws?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.connectionStateSubject.next('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.connectionStateSubject.next('disconnected');

      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.connectionStateSubject.next('error');
    };
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
      }
    }, delay);
  }

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

  // Send methods
  sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

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
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  reconnect(): void {
    this.shouldReconnect = true;
    const token = localStorage.getItem('token');
    if (token) {
      this.connect(token);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

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