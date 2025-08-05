import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface UserPhoto {
  id: number;
  user_id: number;
  file_path: string;
  is_primary: boolean;
  is_private: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LoadingSpinnerComponent
  ],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') private fileInput!: ElementRef;
  @ViewChild('dropZone') private dropZone!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  photos: UserPhoto[] = [];
  currentUser: any = null;
  loading = true;
  uploading = false;
  error = '';
  success = '';
  
  // File upload
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  dragOver = false;
  
  // Photo management
  editingPhoto: UserPhoto | null = null;
  showDeleteConfirm = false;
  photoToDelete: UserPhoto | null = null;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPhotos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  public loadPhotos(): void {
    this.loading = true;
    this.error = '';

    this.profileService.getPhotos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.photos = response.data;
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load photos';
          this.loading = false;
        }
      });
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files) as File[]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        this.error = `${file.name} is not an image file`;
        return false;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.error = `${file.name} is too large. Maximum size is 5MB`;
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      this.error = '';
    }
  }

  onRemoveSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onUploadPhotos(): void {
    if (this.selectedFiles.length === 0) {
      this.error = 'Please select files to upload';
      return;
    }

    this.uploading = true;
    this.error = '';
    this.success = '';

    // Upload files one by one
    const uploadPromises = this.selectedFiles.map(file => {
      return this.profileService.uploadPhoto(file).toPromise();
    });

    Promise.all(uploadPromises)
      .then(() => {
        this.uploading = false;
        this.success = 'Photos uploaded successfully!';
        this.selectedFiles = [];
        this.uploadProgress = {};
        this.loadPhotos();
      })
      .catch((error: any) => {
        this.uploading = false;
        this.error = error.message || 'Failed to upload photos';
      });
  }

  onSetPrimaryPhoto(photo: UserPhoto): void {
    this.profileService.setPrimaryPhoto(photo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Primary photo updated successfully!';
          this.loadPhotos(); // Reload photos
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to set primary photo';
        }
      });
  }

  onTogglePhotoPrivacy(photo: UserPhoto): void {
    this.profileService.togglePhotoPrivacy(photo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPhoto) => {
          this.success = `Photo ${updatedPhoto.is_private ? 'made private' : 'made public'}`;
          setTimeout(() => this.success = '', 3000);
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to update photo privacy';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onDeletePhoto(photo: UserPhoto): void {
    this.photoToDelete = photo;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.photoToDelete) return;

    this.profileService.deletePhoto(this.photoToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Photo deleted successfully!';
          this.showDeleteConfirm = false;
          this.photoToDelete = null;
          this.loadPhotos(); // Reload photos
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to delete photo';
          this.showDeleteConfirm = false;
          this.photoToDelete = null;
        }
      });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.photoToDelete = null;
  }

  onClearSuccess(): void {
    this.success = '';
  }

  onClearError(): void {
    this.error = '';
  }

  getPhotoStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  getPhotoStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  getFileSize(file: File): string {
    const sizeInMB = file.size / (1024 * 1024);
    return sizeInMB < 1 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeInMB.toFixed(1)} MB`;
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  canUploadMore(): boolean {
    const maxPhotos = 6; // Assuming max 6 photos per user
    return this.photos.length + this.selectedFiles.length < maxPhotos;
  }

  getRemainingSlots(): number {
    const maxPhotos = 6;
    return Math.max(0, maxPhotos - this.photos.length - this.selectedFiles.length);
  }
}
