import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LiveProfile {
  id: number;
  first_name: string;
  age: number | null;
  city: string | null;
  country: string | null;
  height_cm: number | null;
  occupation: string | null;
  religion: string | null;
  photo_url: string | null;
  is_online: boolean;
}

@Component({
  selector: 'app-live-profile-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-profile-card.component.html',
  styleUrls: ['./live-profile-card.component.scss']
})
export class LiveProfileCardComponent {
  @Input() profile!: LiveProfile;
  @Output() viewProfile = new EventEmitter<number>();

  onCardClick(): void {
    this.viewProfile.emit(this.profile.id);
  }

  getPhotoUrl(): string {
    return this.profile.photo_url || 'assets/images/default-avatar.png';
  }

  getLocation(): string {
    const parts = [this.profile.city, this.profile.country].filter(Boolean);
    return parts.join(', ') || 'Unknown location';
  }

  getHeight(): string {
    if (!this.profile.height_cm) return '';
    const feet = Math.floor(this.profile.height_cm / 30.48);
    const inches = Math.round((this.profile.height_cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-avatar.png';
    }
  }
}
