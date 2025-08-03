import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface ContentItem {
  id: number;
  user_id: number;
  content_type: 'photo' | 'profile_text' | 'message' | 'comment';
  content: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  flagged_count: number;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  user?: any;
}

interface ContentFilters {
  search: string;
  content_type: string;
  status: string;
  date_range: string;
}

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './content-management.component.html',
  styleUrls: ['./content-management.component.scss']
})
export class ContentManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  
  contentItems: ContentItem[] = [];
  filteredContent: ContentItem[] = [];
  selectedItems: number[] = [];
  
  filters: ContentFilters = {
    search: '',
    content_type: '',
    status: '',
    date_range: ''
  };
  
  filterForm: FormGroup;
  
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  
  showBulkActions = false;
  showContentModal = false;
  selectedContent: ContentItem | null = null;
  
  // Add Math property for template access
  Math = Math;

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];
  
  contentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'photo', label: 'Photos' },
    { value: 'profile_text', label: 'Profile Text' },
    { value: 'message', label: 'Messages' },
    { value: 'comment', label: 'Comments' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      content_type: [''],
      status: [''],
      date_range: ['']
    });
  }

  ngOnInit(): void {
    this.loadContent();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(filters => {
        this.filters = filters;
        this.applyFilters();
      });
  }

  loadContent(): void {
    this.loading = true;
    this.error = '';

    // Mock data - replace with actual API call
    setTimeout(() => {
      this.contentItems = [
        {
          id: 1,
          user_id: 1,
          content_type: 'photo',
          content: 'Profile photo',
          file_url: 'https://example.com/photo1.jpg',
          status: 'pending',
          flagged_count: 2,
          created_at: new Date().toISOString(),
          user: { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com' }
        },
        {
          id: 2,
          user_id: 2,
          content_type: 'profile_text',
          content: 'Looking for someone special to share life with...',
          status: 'approved',
          flagged_count: 0,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reviewed_at: new Date(Date.now() - 3600000).toISOString(),
          reviewed_by: 'admin@example.com',
          user: { first_name: 'Bob', last_name: 'Wilson', email: 'bob@example.com' }
        },
        {
          id: 3,
          user_id: 3,
          content_type: 'message',
          content: 'Hey, I think we have a lot in common!',
          status: 'rejected',
          flagged_count: 5,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          reviewed_at: new Date(Date.now() - 86400000).toISOString(),
          reviewed_by: 'admin@example.com',
          review_notes: 'Inappropriate content - violates community guidelines',
          user: { first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com' }
        }
      ];
      
      this.totalItems = this.contentItems.length;
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  applyFilters(): void {
    this.filteredContent = this.contentItems.filter(item => {
      const searchMatch = !this.filters.search || 
        item.content.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        item.user?.first_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        item.user?.last_name.toLowerCase().includes(this.filters.search.toLowerCase());
      
      const statusMatch = !this.filters.status || item.status === this.filters.status;
      const typeMatch = !this.filters.content_type || item.content_type === this.filters.content_type;
      
      return searchMatch && statusMatch && typeMatch;
    });
    
    this.currentPage = 1;
    this.totalItems = this.filteredContent.length;
  }

  get paginatedContent(): ContentItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredContent.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onContentSelect(itemId: number, checked: boolean): void {
    if (checked) {
      this.selectedItems.push(itemId);
    } else {
      this.selectedItems = this.selectedItems.filter(id => id !== itemId);
    }
    this.showBulkActions = this.selectedItems.length > 0;
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedItems = this.paginatedContent.map(item => item.id);
    } else {
      this.selectedItems = [];
    }
    this.showBulkActions = this.selectedItems.length > 0;
  }

  onViewContent(content: ContentItem): void {
    this.selectedContent = content;
    this.showContentModal = true;
  }

  onApproveContent(itemId: number): void {
    if (confirm('Are you sure you want to approve this content?')) {
      // API call to approve content
      console.log('Approving content:', itemId);
      this.loadContent();
    }
  }

  onRejectContent(itemId: number, reason: string): void {
    if (confirm('Are you sure you want to reject this content?')) {
      // API call to reject content
      console.log('Rejecting content:', itemId, reason);
      this.loadContent();
    }
  }

  onDeleteContent(itemId: number): void {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      // API call to delete content
      console.log('Deleting content:', itemId);
      this.loadContent();
    }
  }

  onBulkAction(action: string): void {
    if (this.selectedItems.length === 0) return;

    const actionText = action === 'approve' ? 'approve' : 
                      action === 'reject' ? 'reject' : 'delete';
    
    if (confirm(`Are you sure you want to ${actionText} ${this.selectedItems.length} content items?`)) {
      // API call for bulk action
      console.log(`Bulk ${action}:`, this.selectedItems);
      this.selectedItems = [];
      this.showBulkActions = false;
      this.loadContent();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getContentTypeBadgeClass(type: string): string {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-800';
      case 'profile_text': return 'bg-purple-100 text-purple-800';
      case 'message': return 'bg-green-100 text-green-800';
      case 'comment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getContentTypeLabel(type: string): string {
    const option = this.contentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getContentPreview(content: string, type: string): string {
    if (type === 'photo') {
      return '📷 Photo';
    }
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  exportContent(): void {
    // Export functionality
    console.log('Exporting content');
  }

  refreshData(): void {
    this.loadContent();
  }
}
