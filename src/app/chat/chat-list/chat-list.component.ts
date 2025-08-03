import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, BehaviorSubject, interval } from 'rxjs';
import { ChatService, Conversation } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    ToastComponent
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  currentUser: any = null;
  
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  searchQuery = '';
  
  // Real-time updates
  onlineUsers: Set<number> = new Set();
  
  // Pagination
  currentPage = 1;
  hasMoreConversations = true;
  loadingMore = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadConversations();
    this.setupWebSocket();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  loadConversations(): void {
    this.loading = true;
    this.error = '';

    this.chatService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newConversations = response || [];
          
          if (this.currentPage === 1) {
            this.conversations = newConversations;
          } else {
            this.conversations = [...this.conversations, ...newConversations];
          }
          
          this.filteredConversations = this.conversations;
          this.hasMoreConversations = newConversations.length === 20; // Assuming page size is 20
          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          this.error = 'Failed to load conversations. Please try again.';
          this.loading = false;
          this.loadingMore = false;
          console.error('Error loading conversations:', error);
        }
      });
  }

  loadMoreConversations(): void {
    if (this.loadingMore || !this.hasMoreConversations) return;
    
    this.loadingMore = true;
    this.currentPage++;
    this.loadConversations();
  }

  private updateUserOnlineStatus(status: any): void {
    if (status.is_online) {
      this.onlineUsers.add(status.user_id);
      this.updateConversationOnlineStatus(status.user_id, true);
    } else {
      this.onlineUsers.delete(status.user_id);
      this.updateConversationOnlineStatus(status.user_id, false);
    }
  }

  private setupWebSocket(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.webSocketService.connect(token);
    }

    // Subscribe to real-time messages
    this.webSocketService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'message') {
          this.handleNewMessage(message.data);
        }
      });

    // Subscribe to online status updates
    this.webSocketService.getOnlineStatusUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.updateUserOnlineStatus(status);
      });
  }

  private setupAutoRefresh(): void {
    // Refresh conversations every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.loading) {
          this.refreshConversations();
        }
      });
  }

  private handleNewMessage(data: any): void {
    const { conversation_id, message } = data;
    
    // Update conversation in the list
    const conversationIndex = this.conversations.findIndex(c => c.id === conversation_id);
    
    if (conversationIndex !== -1) {
      // Update existing conversation
      const conversation = this.conversations[conversationIndex];
      conversation.last_message = message;
      conversation.unread_count += message.sender_id !== this.currentUser?.id ? 1 : 0;
      conversation.updated_at = message.created_at;
      
      // Move conversation to top
      this.conversations.splice(conversationIndex, 1);
      this.conversations.unshift(conversation);
      
      this.filteredConversations = this.conversations;
    } else {
      // New conversation, reload the list
      this.loadConversations();
    }
  }

  private handleMessageRead(data: any): void {
    const { conversation_id, user_id } = data;
    
    if (user_id === this.currentUser?.id) {
      // Mark messages as read in this conversation
      const conversation = this.conversations.find(c => c.id === conversation_id);
      if (conversation) {
        conversation.unread_count = 0;
        if (conversation.last_message) {
          conversation.last_message.is_read = true;
        }
      }
    }
  }

  private updateConversationOnlineStatus(userId: number, isOnline: boolean): void {
    const conversation = this.conversations.find(c => 
      c.user1?.id === userId || c.user2?.id === userId
    );
    if (conversation) {
      // Update online status for the participant
      if (conversation.user1?.id === userId) {
        conversation.user1.is_online = isOnline;
        conversation.user1.last_seen = isOnline ? undefined : new Date().toISOString();
      } else if (conversation.user2?.id === userId) {
        conversation.user2.is_online = isOnline;
        conversation.user2.last_seen = isOnline ? undefined : new Date().toISOString();
      }
    }
  }

  getOtherParticipant(conversation: Conversation): any {
    return conversation.user1?.id === this.currentUser?.id ? conversation.user2 : conversation.user1;
  }

  onSearchConversations(): void {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = this.conversations;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter(conversation => {
      const participant = this.getOtherParticipant(conversation);
      const name = `${participant.first_name} ${participant.last_name}`.toLowerCase();
      const lastMessage = conversation.last_message?.content.toLowerCase() || '';
      
      return name.includes(query) || lastMessage.includes(query);
    });
  }

  onConversationClick(conversationId: number): void {
    this.router.navigate(['/chat', conversationId]);
  }

  onMarkAsRead(conversationId: number): void {
    this.chatService.markConversationAsRead(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const conversation = this.conversations.find(c => c.id === conversationId);
          if (conversation) {
            conversation.unread_count = 0;
            if (conversation.last_message) {
              conversation.last_message.is_read = true;
            }
          }
        },
        error: (error) => {
          console.error('Error marking conversation as read:', error);
        }
      });
  }

  onDeleteConversation(conversationId: number): void {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.chatService.deleteConversation(conversationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            this.filteredConversations = this.conversations;
          },
          error: (error) => {
            console.error('Error deleting conversation:', error);
          }
        });
    }
  }

  onBlockUser(userId: number): void {
    if (confirm('Are you sure you want to block this user? You will no longer receive messages from them.')) {
      // Implement block user functionality
      console.log('Block user:', userId);
    }
  }

  refreshConversations(): void {
    this.currentPage = 1;
    this.loadConversations();
  }

  getOnlineStatus(userId: number): string {
    return this.onlineUsers.has(userId) ? 'online' : 'offline';
  }

  getLastSeenTime(lastSeen: string): string {
    if (!lastSeen) return '';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  getUnreadCount(conversation: Conversation): string {
    if (conversation.unread_count === 0) return '';
    if (conversation.unread_count > 99) return '99+';
    return conversation.unread_count.toString();
  }
}
