import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-romantic">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-romantic text-gradient mb-2">💬 Messages</h1>
          <p class="text-gray-600">Connect with your matches</p>
        </div>

        <!-- Search -->
        <div class="card mb-6">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              class="input-field pl-10"
              [(ngModel)]="searchTerm"
            >
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <!-- Chat List -->
        <div class="space-y-4">
          <div 
            *ngFor="let chat of filteredChats" 
            class="card hover:shadow-romantic transition-all duration-200 cursor-pointer"
            [routerLink]="['/chat', chat.id]"
          >
            <div class="flex items-center space-x-4">
              <!-- Profile Image -->
              <div class="relative">
                <img 
                  [src]="chat.profileImage || 'assets/images/default-avatar.jpg'" 
                  [alt]="chat.name"
                  class="avatar-lg"
                >
                <div 
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  [class.bg-green-500]="chat.isOnline"
                  [class.bg-gray-400]="!chat.isOnline"
                ></div>
              </div>

              <!-- Chat Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ chat.name }}</h3>
                  <span class="text-sm text-gray-500">{{ chat.lastMessageTime }}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-600 truncate flex-1">
                    <span *ngIf="chat.lastMessageFromMe" class="text-primary-600">You: </span>
                    {{ chat.lastMessage }}
                  </p>
                  
                  <!-- Unread Badge -->
                  <div *ngIf="chat.unreadCount > 0" class="ml-2">
                    <span class="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
                    </span>
                  </div>
                </div>

                <!-- Match Info -->
                <div class="flex items-center space-x-4 mt-2">
                  <span class="text-xs text-gray-500">{{ chat.age }} years</span>
                  <span class="text-xs text-gray-500">{{ chat.location }}</span>
                  <div class="flex items-center space-x-1">
                    <span class="text-xs text-gray-500">Match:</span>
                    <div class="w-12 bg-gray-200 rounded-full h-1">
                      <div 
                        class="bg-gradient-to-r from-primary-500 to-rose-500 h-1 rounded-full" 
                        [style.width.%]="chat.compatibilityScore"
                      ></div>
                    </div>
                    <span class="text-xs text-primary-600">{{ chat.compatibilityScore }}%</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col space-y-2">
                <button 
                  class="text-gray-400 hover:text-primary-600 transition-colors"
                  (click)="viewProfile(chat.id, $event)"
                >
                  👤
                </button>
                <button 
                  class="text-gray-400 hover:text-red-600 transition-colors"
                  (click)="unmatch(chat.id, $event)"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredChats.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">💬</div>
          <h3 class="text-xl font-romantic text-gradient mb-2">No conversations yet</h3>
          <p class="text-gray-600 mb-4">Start matching with people to begin conversations</p>
          <button 
            class="btn-primary"
            routerLink="/matches"
          >
            💕 Find Matches
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-12">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChatListComponent implements OnInit {
  chats: any[] = [];
  filteredChats: any[] = [];
  searchTerm = '';
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(): void {
    this.isLoading = true;
    
    // TODO: Implement API call to load conversations
    setTimeout(() => {
      this.chats = [
        {
          id: 1,
          name: 'Priya Sharma',
          age: 26,
          location: 'Colombo, Sri Lanka',
          profileImage: null,
          isOnline: true,
          lastMessage: 'Thank you for the lovely conversation! 😊',
          lastMessageFromMe: false,
          lastMessageTime: '2 min ago',
          unreadCount: 2,
          compatibilityScore: 85
        },
        {
          id: 2,
          name: 'Aisha Khan',
          age: 24,
          location: 'Kandy, Sri Lanka',
          profileImage: null,
          isOnline: false,
          lastMessage: 'I would love to meet you for coffee sometime',
          lastMessageFromMe: true,
          lastMessageTime: '1 hour ago',
          unreadCount: 0,
          compatibilityScore: 78
        },
        {
          id: 3,
          name: 'Nimali Perera',
          age: 28,
          location: 'Galle, Sri Lanka',
          profileImage: null,
          isOnline: true,
          lastMessage: 'That sounds wonderful! When are you free?',
          lastMessageFromMe: false,
          lastMessageTime: '3 hours ago',
          unreadCount: 1,
          compatibilityScore: 92
        },
        {
          id: 4,
          name: 'Maria Silva',
          age: 25,
          location: 'Negombo, Sri Lanka',
          profileImage: null,
          isOnline: false,
          lastMessage: 'I enjoyed our conversation very much',
          lastMessageFromMe: false,
          lastMessageTime: '1 day ago',
          unreadCount: 0,
          compatibilityScore: 76
        }
      ];
      
      this.filteredChats = [...this.chats];
      this.isLoading = false;
    }, 1000);
  }

  viewProfile(chatId: number, event: Event): void {
    event.stopPropagation();
    // TODO: Navigate to profile view
    console.log('Viewing profile for chat:', chatId);
  }

  unmatch(chatId: number, event: Event): void {
    event.stopPropagation();
    // TODO: Implement unmatch functionality
    console.log('Unmatching chat:', chatId);
  }

  // Filter chats based on search term
  filterChats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredChats = [...this.chats];
    } else {
      this.filteredChats = this.chats.filter(chat =>
        chat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
} 