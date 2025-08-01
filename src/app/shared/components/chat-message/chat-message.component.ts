import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  message_type: 'text' | 'image' | 'voice' | 'file';
  file_path?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo?: string;
  };
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;
  @Input() currentUserId!: number;
  @Input() showSenderInfo: boolean = false;
  
  @Output() messageClick = new EventEmitter<ChatMessage>();
  @Output() messageReaction = new EventEmitter<{messageId: number, reaction: string}>();

  isOwnMessage(): boolean {
    return this.message.sender_id === this.currentUserId;
  }

  getMessageTime(): string {
    const date = new Date(this.message.created_at);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getMessageDate(): string {
    const date = new Date(this.message.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  onMessageClick(): void {
    this.messageClick.emit(this.message);
  }

  onReaction(reaction: string): void {
    this.messageReaction.emit({
      messageId: this.message.id,
      reaction: reaction
    });
  }

  getFileIcon(): string {
    switch (this.message.message_type) {
      case 'image':
        return '📷';
      case 'voice':
        return '🎤';
      case 'file':
        return '📎';
      default:
        return '📄';
    }
  }

  getFileSize(): string {
    if (!this.message.file_size) return '';
    
    const bytes = this.message.file_size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  isImageMessage(): boolean {
    return this.message.message_type === 'image' && this.message.file_path;
  }

  isVoiceMessage(): boolean {
    return this.message.message_type === 'voice' && this.message.file_path;
  }

  isFileMessage(): boolean {
    return this.message.message_type === 'file' && this.message.file_path;
  }
} 