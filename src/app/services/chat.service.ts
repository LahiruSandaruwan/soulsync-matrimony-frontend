import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

export interface Conversation {
  id: number;
  user1: User;
  user2: User;
  last_message?: Message;
  unread_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
  receiver?: User;
}

export interface SendMessageRequest {
  receiver_id: number;
  content: string;
  message_type?: 'text' | 'image' | 'voice' | 'file';
  file?: File;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation[];
  message: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  message: string;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
  message: string;
}

export interface ConversationDetailResponse {
  success: boolean;
  data: Conversation;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private currentConversationSubject = new BehaviorSubject<Conversation | null>(null);
  public currentConversation$ = this.currentConversationSubject.asObservable();

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Conversations
  getConversations(): Observable<Conversation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ConversationResponse>(`${environment.apiUrl}/chat/conversations`, { headers })
      .pipe(
        map(response => response.data),
        tap(conversations => {
          this.conversationsSubject.next(conversations);
          this.updateUnreadCount(conversations);
        }),
        catchError(this.handleError)
      );
  }

  getConversation(conversationId: number): Observable<Conversation> {
    const headers = this.getAuthHeaders();
    return this.http.get<ConversationDetailResponse>(`${environment.apiUrl}/chat/conversations/${conversationId}`, { headers })
      .pipe(
        map(response => response.data),
        tap(conversation => {
          this.currentConversationSubject.next(conversation);
        }),
        catchError(this.handleError)
      );
  }

  createConversation(userId: number): Observable<Conversation> {
    const headers = this.getAuthHeaders();
    return this.http.post<ConversationDetailResponse>(`${environment.apiUrl}/chat/conversations`, { user_id: userId }, { headers })
      .pipe(
        map(response => response.data),
        tap(conversation => {
          const currentConversations = this.conversationsSubject.value;
          this.conversationsSubject.next([conversation, ...currentConversations]);
        }),
        catchError(this.handleError)
      );
  }

  deleteConversation(conversationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/chat/conversations/${conversationId}`, { headers })
      .pipe(
        tap(() => {
          const currentConversations = this.conversationsSubject.value;
          const filteredConversations = currentConversations.filter(c => c.id !== conversationId);
          this.conversationsSubject.next(filteredConversations);
          
          if (this.currentConversationSubject.value?.id === conversationId) {
            this.currentConversationSubject.next(null);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Messages
  getMessages(conversationId: number, page: number = 1, limit: number = 50): Observable<Message[]> {
    const headers = this.getAuthHeaders();
    const params = { page: page.toString(), limit: limit.toString() };
    
    return this.http.get<MessagesResponse>(`${environment.apiUrl}/chat/conversations/${conversationId}/messages`, { 
      headers, 
      params 
    }).pipe(
      map(response => response.data),
      tap(messages => {
        if (page === 1) {
          this.messagesSubject.next(messages);
        } else {
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([...messages, ...currentMessages]);
        }
      }),
      catchError(this.handleError)
    );
  }

  sendMessage(request: SendMessageRequest): Observable<Message> {
    const headers = this.getAuthHeaders();
    let body: FormData | any;

    if (request.file) {
      body = new FormData();
      body.append('receiver_id', request.receiver_id.toString());
      body.append('content', request.content);
      body.append('message_type', request.message_type || 'text');
      body.append('file', request.file);
    } else {
      body = {
        receiver_id: request.receiver_id,
        content: request.content,
        message_type: request.message_type || 'text'
      };
    }

    return this.http.post<MessageResponse>(`${environment.apiUrl}/chat/messages`, body, { headers })
      .pipe(
        map(response => response.data),
        tap(message => {
          // Add to current messages
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([...currentMessages, message]);
          
          // Update conversation last message
          this.updateConversationLastMessage(message);
        }),
        catchError(this.handleError)
      );
  }

  sendTextMessage(receiverId: number, content: string): Observable<Message> {
    return this.sendMessage({ receiver_id: receiverId, content });
  }

  sendImageMessage(receiverId: number, file: File): Observable<Message> {
    return this.sendMessage({ 
      receiver_id: receiverId, 
      content: 'Image', 
      message_type: 'image', 
      file 
    });
  }

  sendVoiceMessage(receiverId: number, file: File): Observable<Message> {
    return this.sendMessage({ 
      receiver_id: receiverId, 
      content: 'Voice message', 
      message_type: 'voice', 
      file 
    });
  }

  sendFileMessage(receiverId: number, file: File): Observable<Message> {
    return this.sendMessage({ 
      receiver_id: receiverId, 
      content: file.name, 
      message_type: 'file', 
      file 
    });
  }

  markMessageAsRead(messageId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/chat/messages/${messageId}/read`, {}, { headers })
      .pipe(
        tap(() => {
          const currentMessages = this.messagesSubject.value;
          const updatedMessages = currentMessages.map(msg => 
            msg.id === messageId ? { ...msg, is_read: true } : msg
          );
          this.messagesSubject.next(updatedMessages);
        }),
        catchError(this.handleError)
      );
  }

  markConversationAsRead(conversationId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/chat/conversations/${conversationId}/read`, {}, { headers })
      .pipe(
        tap(() => {
          // Update conversation unread count
          const currentConversations = this.conversationsSubject.value;
          const updatedConversations = currentConversations.map(conv => 
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          );
          this.conversationsSubject.next(updatedConversations);
          
          // Update current conversation
          if (this.currentConversationSubject.value?.id === conversationId) {
            this.currentConversationSubject.next({
              ...this.currentConversationSubject.value,
              unread_count: 0
            });
          }
          
          this.updateUnreadCount(updatedConversations);
        }),
        catchError(this.handleError)
      );
  }

  deleteMessage(messageId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/chat/messages/${messageId}`, { headers })
      .pipe(
        tap(() => {
          const currentMessages = this.messagesSubject.value;
          const filteredMessages = currentMessages.filter(msg => msg.id !== messageId);
          this.messagesSubject.next(filteredMessages);
        }),
        catchError(this.handleError)
      );
  }

  // Search
  searchMessages(conversationId: number, query: string): Observable<Message[]> {
    const headers = this.getAuthHeaders();
    const params = { q: query };
    
    return this.http.get<MessagesResponse>(`${environment.apiUrl}/chat/conversations/${conversationId}/search`, { 
      headers, 
      params 
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Typing indicators
  sendTypingIndicator(conversationId: number, isTyping: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${environment.apiUrl}/chat/conversations/${conversationId}/typing`, { 
      is_typing: isTyping 
    }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // File upload
  uploadFile(file: File): Observable<{ url: string; file_name: string; file_size: number }> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean, data: any }>(`${environment.apiUrl}/chat/upload`, formData, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Utility Methods
  private updateConversationLastMessage(message: Message): void {
    const currentConversations = this.conversationsSubject.value;
    const updatedConversations = currentConversations.map(conv => {
      if (conv.id === message.conversation_id) {
        return {
          ...conv,
          last_message: message,
          updated_at: message.created_at
        };
      }
      return conv;
    });
    this.conversationsSubject.next(updatedConversations);
  }

  private updateUnreadCount(conversations: Conversation[]): void {
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
    this.unreadCountSubject.next(totalUnread);
  }

  getConversationsValue(): Conversation[] {
    return this.conversationsSubject.value;
  }

  getCurrentConversationValue(): Conversation | null {
    return this.currentConversationSubject.value;
  }

  getMessagesValue(): Message[] {
    return this.messagesSubject.value;
  }

  getUnreadCountValue(): number {
    return this.unreadCountSubject.value;
  }

  setCurrentConversation(conversation: Conversation | null): void {
    this.currentConversationSubject.next(conversation);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  clearCache(): void {
    this.conversationsSubject.next([]);
    this.currentConversationSubject.next(null);
    this.messagesSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Chat Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 