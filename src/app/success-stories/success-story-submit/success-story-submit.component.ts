import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { SuccessStoryService } from '../../core/services/success-story.service';
import { UserSearchResult } from '../../core/models/success-story.model';

@Component({
  selector: 'app-success-story-submit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './success-story-submit.component.html',
  styleUrls: ['./success-story-submit.component.scss']
})
export class SuccessStorySubmitComponent implements OnInit, OnDestroy {
  storyForm!: FormGroup;
  submitting = false;
  error = '';
  success = '';

  // Photo handling
  selectedPhotos: File[] = [];
  photoPreviewUrls: string[] = [];
  maxPhotos = 10;
  maxPhotoSize = 5 * 1024 * 1024; // 5MB

  // Partner search
  partnerSearchQuery = '';
  partnerSearchResults: UserSearchResult[] = [];
  searchingPartner = false;
  selectedPartner: UserSearchResult | null = null;

  // Date constraint
  today = new Date().toISOString().split('T')[0];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private successStoryService: SuccessStoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupPartnerSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Revoke object URLs
    this.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }

  private initForm(): void {
    this.storyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(100)]],
      how_they_met: ['', Validators.maxLength(2000)],
      story_location: ['', Validators.maxLength(255)],
      marriage_date: [''],
      couple_user2_id: [null]
    });
  }

  private setupPartnerSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          return of([]);
        }
        this.searchingPartner = true;
        return this.successStoryService.searchUsers(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.partnerSearchResults = results;
        this.searchingPartner = false;
      },
      error: () => {
        this.partnerSearchResults = [];
        this.searchingPartner = false;
      }
    });
  }

  onPartnerSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.partnerSearchQuery = query;
    this.searchSubject.next(query);
  }

  selectPartner(partner: UserSearchResult): void {
    this.selectedPartner = partner;
    this.storyForm.patchValue({ couple_user2_id: partner.id });
    this.partnerSearchResults = [];
    this.partnerSearchQuery = '';
  }

  removePartner(): void {
    this.selectedPartner = null;
    this.storyForm.patchValue({ couple_user2_id: null });
  }

  // Photo handling
  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const remainingSlots = this.maxPhotos - this.selectedPhotos.length;

    if (files.length > remainingSlots) {
      this.error = `You can only add ${remainingSlots} more photos (max ${this.maxPhotos})`;
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select only image files';
        return;
      }
      if (file.size > this.maxPhotoSize) {
        this.error = `Photo "${file.name}" is too large. Max size is 5MB`;
        return;
      }
    }

    this.error = '';
    files.forEach(file => {
      this.selectedPhotos.push(file);
      this.photoPreviewUrls.push(URL.createObjectURL(file));
    });

    // Reset input
    input.value = '';
  }

  removePhoto(index: number): void {
    URL.revokeObjectURL(this.photoPreviewUrls[index]);
    this.selectedPhotos.splice(index, 1);
    this.photoPreviewUrls.splice(index, 1);
  }

  // Form submission
  submit(asDraft: boolean = false): void {
    if (this.storyForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = '';

    const formData = {
      ...this.storyForm.value,
      submit_for_approval: !asDraft
    };

    this.successStoryService.submitStory(formData, this.selectedPhotos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (story) => {
          this.submitting = false;
          if (asDraft) {
            this.success = 'Your story has been saved as draft!';
          } else {
            this.success = 'Your story has been submitted for review! We will notify you once approved.';
          }
          // Navigate after short delay
          setTimeout(() => {
            this.router.navigate(['/success-stories', story.id]);
          }, 2000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = err?.error?.message || err?.message || 'Failed to submit story. Please try again.';
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.values(this.storyForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.storyForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.storyForm.get(field);
    if (!control?.errors) return '';

    if (control.errors['required']) return `${this.getFieldLabel(field)} is required`;
    if (control.errors['minlength']) return `${this.getFieldLabel(field)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${this.getFieldLabel(field)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    return 'Invalid input';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      description: 'Story',
      how_they_met: 'How you met',
      story_location: 'Location',
      marriage_date: 'Marriage date'
    };
    return labels[field] || field;
  }

  get descriptionLength(): number {
    return this.storyForm.get('description')?.value?.length || 0;
  }
}
