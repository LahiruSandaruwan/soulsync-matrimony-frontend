import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface UserCard {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  current_city: string;
  current_country: string;
  occupation: string;
  education_level: string;
  photos: Array<{
    id: number;
    file_path: string;
    is_primary: boolean;
  }>;
  profile_completion: number;
  is_online: boolean;
  last_seen: string;
  match_percentage?: number;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent {
  @Input() user!: UserCard;
  @Input() showActions: boolean = true;
  @Input() showMatchPercentage: boolean = false;
  
  @Output() like = new EventEmitter<number>();
  @Output() dislike = new EventEmitter<number>();
  @Output() superLike = new EventEmitter<number>();
  @Output() viewProfile = new EventEmitter<number>();

  onLike(): void {
    this.like.emit(this.user.id);
  }

  onDislike(): void {
    this.dislike.emit(this.user.id);
  }

  onSuperLike(): void {
    this.superLike.emit(this.user.id);
  }

  onViewProfile(): void {
    this.viewProfile.emit(this.user.id);
  }

  getPrimaryPhoto(): string {
    const primaryPhoto = this.user.photos?.find(photo => photo.is_primary);
    return primaryPhoto?.file_path || 'assets/images/default-avatar.png';
  }

  getAge(): number {
    // Calculate age from date of birth if available
    return this.user.age || 25;
  }

  getLocation(): string {
    const city = this.user.current_city || '';
    const country = this.user.current_country || '';
    return [city, country].filter(Boolean).join(', ');
  }
} 