import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  id: number;
  original_name: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'document' | 'video' | 'audio';
  uploaded_at: string;
  user_id: number;
}

export interface UploadResponse {
  success: boolean;
  data: UploadedFile;
  message: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data: UploadedFile[];
  message: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private uploadProgressSubject = new BehaviorSubject<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  private isUploadingSubject = new BehaviorSubject<boolean>(false);
  public isUploading$ = this.isUploadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Upload single file
  uploadFile(file: File, type: 'profile_photo' | 'gallery_photo' | 'document' | 'chat_file' = 'profile_photo'): Observable<UploadedFile> {
    this.isUploadingSubject.next(true);
    this.resetProgress();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = this.getAuthHeaders();

    return this.http.post<UploadResponse>(`${environment.apiUrl}/upload/file`, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event as HttpProgressEvent;
          this.updateProgress(progress.loaded, progress.total || 0);
        } else if (event.type === HttpEventType.Response) {
          this.isUploadingSubject.next(false);
          return event.body?.data;
        }
        return null;
      }),
      catchError(error => {
        this.isUploadingSubject.next(false);
        this.resetProgress();
        return this.handleError(error);
      })
    );
  }

  // Upload multiple files
  uploadMultipleFiles(files: File[], type: 'gallery_photos' | 'documents' = 'gallery_photos'): Observable<UploadedFile[]> {
    this.isUploadingSubject.next(true);
    this.resetProgress();

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('type', type);

    const headers = this.getAuthHeaders();

    return this.http.post<MultipleUploadResponse>(`${environment.apiUrl}/upload/multiple`, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event as HttpProgressEvent;
          this.updateProgress(progress.loaded, progress.total || 0);
        } else if (event.type === HttpEventType.Response) {
          this.isUploadingSubject.next(false);
          return event.body?.data;
        }
        return null;
      }),
      catchError(error => {
        this.isUploadingSubject.next(false);
        this.resetProgress();
        return this.handleError(error);
      })
    );
  }

  // Upload profile photo
  uploadProfilePhoto(file: File): Observable<UploadedFile> {
    return this.uploadFile(file, 'profile_photo');
  }

  // Upload gallery photos
  uploadGalleryPhotos(files: File[]): Observable<UploadedFile[]> {
    return this.uploadMultipleFiles(files, 'gallery_photos');
  }

  // Upload chat file
  uploadChatFile(file: File): Observable<UploadedFile> {
    return this.uploadFile(file, 'chat_file');
  }

  // Upload document
  uploadDocument(file: File): Observable<UploadedFile> {
    return this.uploadFile(file, 'document');
  }

  // Delete uploaded file
  deleteFile(fileId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/upload/files/${fileId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Get user's uploaded files
  getUserFiles(type?: string): Observable<UploadedFile[]> {
    const headers = this.getAuthHeaders();
    const params = type ? { type } : {};

    return this.http.get<{ success: boolean, data: UploadedFile[] }>(`${environment.apiUrl}/upload/files`, { headers, params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Validate file before upload
  validateFile(file: File, allowedTypes: string[] = [], maxSize: number = 10 * 1024 * 1024): FileValidationResult {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${this.formatFileSize(maxSize)}`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    // Check for common image types
    if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB for images
        errors.push('Image size must be less than 5MB');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate image file
  validateImage(file: File): FileValidationResult {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return this.validateFile(file, allowedTypes, 5 * 1024 * 1024); // 5MB
  }

  // Validate document file
  validateDocument(file: File): FileValidationResult {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return this.validateFile(file, allowedTypes, 10 * 1024 * 1024); // 10MB
  }

  // Compress image before upload
  compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Create thumbnail from image
  createThumbnail(file: File, width: number = 150, height: number = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = width;
        let drawHeight = height;

        if (aspectRatio > 1) {
          drawHeight = width / aspectRatio;
        } else {
          drawWidth = height * aspectRatio;
        }

        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        ctx?.drawImage(img, x, y, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => reject(new Error('Failed to create thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Utility methods
  private updateProgress(loaded: number, total: number): void {
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
    this.uploadProgressSubject.next({ loaded, total, percentage });
  }

  private resetProgress(): void {
    this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get current values
  getUploadProgressValue(): UploadProgress {
    return this.uploadProgressSubject.value;
  }

  getIsUploadingValue(): boolean {
    return this.isUploadingSubject.value;
  }

  // Clear progress
  clearProgress(): void {
    this.resetProgress();
    this.isUploadingSubject.next(false);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Upload failed';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('File Upload Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 