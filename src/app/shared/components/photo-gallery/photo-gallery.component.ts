import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Photo {
  id: number;
  file_path: string;
  is_primary: boolean;
  is_private: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss']
})
export class PhotoGalleryComponent {
  @Input() photos: Photo[] = [];
  @Input() showActions: boolean = false;
  @Input() maxPhotos: number = 6;
  
  @Output() photoClick = new EventEmitter<Photo>();
  @Output() setPrimary = new EventEmitter<number>();
  @Output() deletePhoto = new EventEmitter<number>();
  @Output() togglePrivacy = new EventEmitter<number>();

  selectedPhoto: Photo | null = null;
  showModal: boolean = false;

  onPhotoClick(photo: Photo): void {
    this.selectedPhoto = photo;
    this.showModal = true;
    this.photoClick.emit(photo);
  }

  onSetPrimary(photoId: number, event: Event): void {
    event.stopPropagation();
    this.setPrimary.emit(photoId);
  }

  onDeletePhoto(photoId: number, event: Event): void {
    event.stopPropagation();
    this.deletePhoto.emit(photoId);
  }

  onTogglePrivacy(photoId: number, event: Event): void {
    event.stopPropagation();
    this.togglePrivacy.emit(photoId);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPhoto = null;
  }

  getDisplayPhotos(): Photo[] {
    return this.photos.slice(0, this.maxPhotos);
  }

  getPrimaryPhoto(): Photo | null {
    return this.photos.find(photo => photo.is_primary) || null;
  }

  getApprovedPhotos(): Photo[] {
    return this.photos.filter(photo => photo.status === 'approved');
  }

  getPhotoStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
} 