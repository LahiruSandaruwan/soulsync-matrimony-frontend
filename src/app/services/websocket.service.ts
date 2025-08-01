import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ChatService, Message } from './chat.service';
import { NotificationService, Notification } from './notification.service';

export interface WebSocketMessage {
  type: 'chat' | 'notification' | 'match' | 'typing' | 'online_status' | 'ping' | 'pong';
  data: any;
  timestamp: string;
}

export interface TypingIndicator {
  user_id: number;
  conversation_id: number;
  is_typing: boolean;
}

export interface OnlineStatus {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

export interface WebSocketConnection {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private connectionSubject = new BehaviorSubject<WebSocketConnection>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0
  });
  public connection$ = this.connectionSubject.asObservable();

  private messageSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messageSubject.asObservable();

  private typingSubject = new Subject<TypingIndicator>();
  public typing$ = this.typingSubject.asObservable();

  private onlineStatusSubject = new Subject<OnlineStatus>();
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  private reconnectTimer: any;
  private pingTimer: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = environment.realtime.maxReconnectAttempts;
  private reconnectInterval = environment.realtime.reconnectInterval;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {
    this.setupAuthSubscription();
  }

  private setupAuthSubscription(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.connectionSubject.value.isConnecting) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return;
    }

    this.updateConnection({ isConnecting: true });

    try {
      const wsUrl = `${environment.wsUrl}?token=${token}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateConnection({
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          lastConnected: new Date()
        });
        this.startPingTimer();
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
        this.updateConnection({ isConnected: false, isConnecting: false });
        this.stopPingTimer();
        
        if (event.code !== 1000) { // Not a normal closure
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnection({ isConnected: false, isConnecting: false });
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.updateConnection({ isConnected: false, isConnecting: false });
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User logout');
      this.socket = null;
    }
    
    this.stopPingTimer();
    this.clearReconnectTimer();
    
    this.updateConnection({
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnection({ reconnectAttempts: this.reconnectAttempts });

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, this.reconnectInterval);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPingTimer(): void {
    this.stopPingTimer();
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, 30000); // Send ping every 30 seconds
  }

  private stopPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private sendPing(): void {
    if (this.isConnected()) {
      this.send({
        type: 'ping',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'chat':
        this.handleChatMessage(message.data);
        break;
      case 'notification':
        this.handleNotification(message.data);
        break;
      case 'match':
        this.handleMatchUpdate(message.data);
        break;
      case 'typing':
        this.handleTypingIndicator(message.data);
        break;
      case 'online_status':
        this.handleOnlineStatus(message.data);
        break;
      case 'pong':
        // Handle pong response
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }

    this.messageSubject.next(message);
  }

  private handleChatMessage(data: any): void {
    if (data.message) {
      const message: Message = data.message;
      this.chatService.addMessage(message);
    }
  }

  private handleNotification(data: any): void {
    if (data.notification) {
      const notification: Notification = data.notification;
      this.notificationService.addNotification(notification);
    }
  }

  private handleMatchUpdate(data: any): void {
    // Handle match updates (new matches, status changes, etc.)
    console.log('Match update received:', data);
  }

  private handleTypingIndicator(data: any): void {
    const typingIndicator: TypingIndicator = {
      user_id: data.user_id,
      conversation_id: data.conversation_id,
      is_typing: data.is_typing
    };
    this.typingSubject.next(typingIndicator);
  }

  private handleOnlineStatus(data: any): void {
    const onlineStatus: OnlineStatus = {
      user_id: data.user_id,
      is_online: data.is_online,
      last_seen: data.last_seen
    };
    this.onlineStatusSubject.next(onlineStatus);
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected() && this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  sendChatMessage(message: Message): void {
    this.send({
      type: 'chat',
      data: { message },
      timestamp: new Date().toISOString()
    });
  }

  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    this.send({
      type: 'typing',
      data: {
        conversation_id: conversationId,
        is_typing: isTyping
      },
      timestamp: new Date().toISOString()
    });
  }

  sendNotification(notification: Notification): void {
    this.send({
      type: 'notification',
      data: { notification },
      timestamp: new Date().toISOString()
    });
  }

  // Utility Methods
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionValue(): WebSocketConnection {
    return this.connectionSubject.value;
  }

  private updateConnection(updates: Partial<WebSocketConnection>): void {
    const current = this.connectionSubject.value;
    this.connectionSubject.next({ ...current, ...updates });
  }

  // Public methods for external use
  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  getConnectionStatus(): Observable<WebSocketConnection> {
    return this.connection$;
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.messages$;
  }

  getTypingIndicators(): Observable<TypingIndicator> {
    return this.typing$;
  }

  getOnlineStatusUpdates(): Observable<OnlineStatus> {
    return this.onlineStatus$;
  }
} 