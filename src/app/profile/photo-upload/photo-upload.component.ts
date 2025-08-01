import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService, PhotoUploadRequest } from '../../services/profile.service';
import { UserPhoto } from '../../models/user.model';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📸 Photo Management</h1>
              <p class="text-gray-600">Upload and manage your profile photos to showcase your personality</p>
            </div>
            <button 
              (click)="goBack()"
              class="bg-white border-2 border-pink-500 text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
              ← Back
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center min-h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>

        <!-- Photo Management Content -->
        <div *ngIf="!isLoading" class="space-y-8">
          <!-- Upload Section -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-2xl mr-3">📤</span>
              Upload New Photos
            </h2>
            
            <!-- Drag & Drop Zone -->
            <div 
              class="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors cursor-pointer"
              [class.border-pink-500]="isDragOver"
              [class.bg-pink-50]="isDragOver"
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)">
              
              <div class="text-6xl mb-4">📷</div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">Drop photos here or click to browse</h3>
              <p class="text-gray-500 mb-4">Upload up to 6 photos (JPG, PNG, GIF up to 5MB each)</p>
              <button 
                type="button"
                class="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                Choose Files
              </button>
              
              <input 
                #fileInput
                type="file" 
                multiple 
                accept="image/*"
                (change)="onFileSelected($event)"
                class="hidden">
            </div>

            <!-- Upload Progress -->
            <div *ngIf="uploadingFiles.length > 0" class="mt-6 space-y-3">
              <h4 class="font-semibold text-gray-700">Uploading...</h4>
              <div *ngFor="let file of uploadingFiles" class="bg-gray-50 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">{{ file.name }}</span>
                  <span class="text-sm text-pink-600">{{ file.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    class="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="file.progress">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Photos -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-2xl mr-3">🖼️</span>
              Your Photos
            </h2>
            
            <div *ngIf="photos.length === 0" class="text-center py-12">
              <div class="text-6xl mb-4">📷</div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">No Photos Yet</h3>
              <p class="text-gray-500 mb-4">Upload your first photo to get started</p>
            </div>

            <div *ngIf="photos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                *ngFor="let photo of photos; trackBy: trackByPhotoId"
                class="relative group aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                
                <!-- Photo Image -->
                <img 
                  [src]="photo.file_path" 
                  [alt]="'Photo ' + photo.id"
                  class="w-full h-full object-cover"
                  (error)="onImageError($event)"
                >
                
                <!-- Overlay Actions -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                    <button 
                      *ngIf="!photo.is_primary"
                      (click)="setPrimaryPhoto(photo.id)"
                      class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Set as primary photo">
                      👑
                    </button>
                    <button 
                      (click)="deletePhoto(photo.id)"
                      class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="Delete photo">
                      🗑️
                    </button>
                  </div>
                </div>
                
                <!-- Status Badges -->
                <div *ngIf="photo.is_primary" class="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Primary
                </div>
                <div *ngIf="photo.is_private" class="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Private
                </div>
                <div *ngIf="photo.status === 'pending'" class="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Pending
                </div>
                <div *ngIf="photo.status === 'rejected'" class="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Rejected
                </div>
              </div>
            </div>
          </div>

          <!-- Photo Guidelines -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span class="text-2xl mr-3">💡</span>
              Photo Guidelines
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-gray-700 mb-3">✅ Do's</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    Use clear, high-quality photos
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    Show your face clearly in the first photo
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    Include photos that show your interests
                  </li>
                  <li class="flex items-start">
                    <span class="text-green-500 mr-2">✓</span>
                    Use recent photos (within 2 years)
                  </li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-700 mb-3">❌ Don'ts</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li class="flex items-start">
                    <span class="text-red-500 mr-2">✗</span>
                    Don't use group photos as primary
                  </li>
                  <li class="flex items-start">
                    <span class="text-red-500 mr-2">✗</span>
                    Avoid blurry or low-quality images
                  </li>
                  <li class="flex items-start">
                    <span class="text-red-500 mr-2">✗</span>
                    Don't upload inappropriate content
                  </li>
                  <li class="flex items-start">
                    <span class="text-red-500 mr-2">✗</span>
                    Avoid heavily filtered photos
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-4">
            <button 
              (click)="goBack()"
              class="bg-white border-2 border-pink-500 text-pink-600 px-8 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all duration-200">
              ← Back to Profile
            </button>
            <button 
              (click)="viewProfile()"
              class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              👤 View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-gradient-romantic {
      background: linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%);
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class PhotoUploadComponent implements OnInit, OnDestroy {
  photos: UserPhoto[] = [];
  uploadingFiles: Array<{ name: string; progress: number }> = [];
  isLoading = true;
  isDragOver = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPhotos(): void {
    this.isLoading = true;
    this.profileService.getPhotos().subscribe({
      next: (photos) => {
        this.photos = photos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        this.isLoading = false;
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      this.showErrorMessage('Please select only image files.');
      return;
    }

    if (this.photos.length + imageFiles.length > 6) {
      this.showErrorMessage('You can only upload up to 6 photos total.');
      return;
    }

    imageFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showErrorMessage(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      this.uploadFile(file);
    });
  }

  private uploadFile(file: File): void {
    const uploadingFile = { name: file.name, progress: 0 };
    this.uploadingFiles.push(uploadingFile);

    const request: PhotoUploadRequest = {
      file,
      is_primary: this.photos.length === 0, // First photo becomes primary
      is_private: false
    };

    this.profileService.uploadPhoto(request).subscribe({
      next: (photo) => {
        this.photos.push(photo);
        this.removeUploadingFile(file.name);
        this.showSuccessMessage(`Photo ${file.name} uploaded successfully!`);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.removeUploadingFile(file.name);
        this.showErrorMessage(`Failed to upload ${file.name}. Please try again.`);
      }
    });

    // Simulate upload progress (in real app, you'd get this from the upload service)
    const progressInterval = setInterval(() => {
      const fileIndex = this.uploadingFiles.findIndex(f => f.name === file.name);
      if (fileIndex !== -1) {
        this.uploadingFiles[fileIndex].progress += 10;
        if (this.uploadingFiles[fileIndex].progress >= 100) {
          clearInterval(progressInterval);
        }
      }
    }, 200);
  }

  private removeUploadingFile(fileName: string): void {
    this.uploadingFiles = this.uploadingFiles.filter(f => f.name !== fileName);
  }

  setPrimaryPhoto(photoId: number): void {
    this.profileService.setPrimaryPhoto(photoId).subscribe({
      next: (updatedPhoto) => {
        // Update photos array
        this.photos = this.photos.map(photo => ({
          ...photo,
          is_primary: photo.id === photoId
        }));
        this.showSuccessMessage('Primary photo updated successfully!');
      },
      error: (error) => {
        console.error('Error setting primary photo:', error);
        this.showErrorMessage('Failed to set primary photo. Please try again.');
      }
    });
  }

  deletePhoto(photoId: number): void {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photoId).subscribe({
        next: () => {
          this.photos = this.photos.filter(photo => photo.id !== photoId);
          this.showSuccessMessage('Photo deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
          this.showErrorMessage('Failed to delete photo. Please try again.');
        }
      });
    }
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-avatar.jpg';
  }

  trackByPhotoId(index: number, photo: UserPhoto): number {
    return photo.id;
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  private showSuccessMessage(message: string): void {
    // You can implement a toast notification service here
    console.log('Success:', message);
  }

  private showErrorMessage(message: string): void {
    // You can implement a toast notification service here
    console.error('Error:', message);
  }
} 