import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Chat Header -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                class="text-gray-600 hover:text-primary-600 transition-colors"
                routerLink="/chat"
              >
                ← Back
              </button>
              <div class="relative">
                <img 
                  [src]="currentChat?.profileImage || 'assets/images/default-avatar.jpg'" 
                  [alt]="currentChat?.name"
                  class="avatar-md"
                >
                <div 
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  [class.bg-green-500]="currentChat?.isOnline"
                  [class.bg-gray-400]="!currentChat?.isOnline"
                ></div>
              </div>
              <div>
                <h2 class="text-xl font-romantic text-gradient">{{ currentChat?.name }}</h2>
                <p class="text-sm text-gray-600">
                  {{ currentChat?.isOnline ? '🟢 Online' : '⚫ Offline' }} • 
                  {{ currentChat?.age }} years • {{ currentChat?.location }}
                </p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                class="text-gray-600 hover:text-primary-600 transition-colors"
                (click)="viewProfile()"
              >
                👤 Profile
              </button>
              <button 
                class="text-gray-600 hover:text-red-600 transition-colors"
                (click)="unmatch()"
              >
                ❌ Unmatch
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Container -->
        <div class="card h-96 mb-6 overflow-hidden">
          <div 
            #messagesContainer
            class="h-full overflow-y-auto p-4 space-y-4"
          >
            <!-- Date Separator -->
            <div class="text-center">
              <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                Today
              </span>
            </div>

            <!-- Messages -->
            <div 
              *ngFor="let message of messages" 
              class="flex"
              [class.justify-end]="message.isFromMe"
              [class.justify-start]="!message.isFromMe"
            >
              <div 
                class="max-w-xs lg:max-w-md"
                [class]="message.isFromMe ? 'chat-bubble-own' : 'chat-bubble'"
              >
                <p class="text-sm">{{ message.content }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs opacity-70">{{ message.time }}</span>
                  <span *ngIf="message.isFromMe" class="text-xs opacity-70">
                    {{ message.isRead ? '✓✓' : '✓' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div *ngIf="isTyping" class="flex justify-start">
              <div class="chat-bubble">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="card">
          <form (ngSubmit)="sendMessage()" class="flex space-x-4">
            <div class="flex-1">
              <input 
                type="text" 
                [(ngModel)]="newMessage" 
                name="message"
                placeholder="Type your message..." 
                class="input-field"
                (keyup.enter)="sendMessage()"
                [disabled]="isSending"
              >
            </div>
            <button 
              type="submit" 
              class="btn-primary"
              [disabled]="!newMessage.trim() || isSending"
            >
              <span *ngIf="isSending" class="loading-spinner mr-2"></span>
              {{ isSending ? 'Sending...' : '💝 Send' }}
            </button>
          </form>
        </div>

        <!-- Empty State -->
        <div *ngIf="!currentChat" class="text-center py-12">
          <div class="text-6xl mb-4">💬</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">Select a conversation</h3>
          <p class="text-gray-600 mb-4">Choose a chat from your conversations to start messaging</p>
          <button 
            class="btn-primary"
            routerLink="/chat"
          >
            💬 View Conversations
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  currentChat: any = null;
  messages: any[] = [];
  newMessage = '';
  isSending = false;
  isTyping = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const conversationId = params['conversationId'];
      if (conversationId) {
        this.loadConversation(conversationId);
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadConversation(conversationId: string): void {
    // TODO: Implement API call to load conversation
    this.currentChat = {
      id: conversationId,
      name: 'Priya Sharma',
      age: 26,
      location: 'Colombo, Sri Lanka',
      profileImage: null,
      isOnline: true
    };

    // Mock messages
    this.messages = [
      {
        id: 1,
        content: 'Hi! I really enjoyed your profile 😊',
        isFromMe: false,
        time: '10:30 AM',
        isRead: true
      },
      {
        id: 2,
        content: 'Thank you! I liked yours too. How are you doing?',
        isFromMe: true,
        time: '10:32 AM',
        isRead: true
      },
      {
        id: 3,
        content: 'I\'m doing great! I love that you enjoy traveling. What\'s your favorite place you\'ve visited?',
        isFromMe: false,
        time: '10:35 AM',
        isRead: true
      },
      {
        id: 4,
        content: 'I loved Japan! The culture and food were amazing. Have you been there?',
        isFromMe: true,
        time: '10:37 AM',
        isRead: false
      }
    ];
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isSending) return;

    this.isSending = true;
    
    // Add message to local array
    const message = {
      id: Date.now(),
      content: this.newMessage,
      isFromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    this.messages.push(message);
    this.newMessage = '';

    // TODO: Implement API call to send message
    setTimeout(() => {
      this.isSending = false;
      
      // Simulate typing indicator
      this.isTyping = true;
      setTimeout(() => {
        this.isTyping = false;
        
        // Simulate reply
        const reply = {
          id: Date.now() + 1,
          content: 'That sounds wonderful! I\'d love to visit Japan someday. What was your favorite part?',
          isFromMe: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        this.messages.push(reply);
      }, 2000);
    }, 1000);
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Handle error
    }
  }

  viewProfile(): void {
    // TODO: Navigate to profile view
    console.log('Viewing profile');
  }

  unmatch(): void {
    // TODO: Implement unmatch functionality
    console.log('Unmatching');
  }
} 