import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface ContentItem {
  id: number;
  name: string;
  category: string;
  description?: string;
  content?: string;
  content_type?: string;
  status?: string;
  review_notes?: string;
  reviewed_at?: string;
  flagged_count?: number;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

interface ContentFilters {
  search: string;
  category: string;
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
    category: ''
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

  categories = ['', 'hobbies', 'lifestyle', 'values', 'education', 'food'];

  // Add missing properties
  contentTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Document' }
  ];

  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'under_review', label: 'Under Review' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private api: ApiService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: ['']
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

    this.api.get<any>('/admin/content')
      .subscribe({
        next: (response) => {
          this.contentItems = response.data || [];
          this.totalItems = this.contentItems.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load content';
          this.loading = false;
          console.error('Error loading content:', error);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.contentItems];

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.content?.toLowerCase().includes(search)
      );
    }

    if (this.filters.category) {
      filtered = filtered.filter(item => item.category === this.filters.category);
    }

    this.filteredContent = filtered;
    this.currentPage = 1;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  onApproveContent(contentId: number): void {
    this.api.put(`/admin/content/${contentId}/approve`, {})
      .subscribe({
        next: () => {
          this.loadContent();
        },
        error: (error) => {
          console.error('Error approving content:', error);
        }
      });
  }

  onRejectContent(contentId: number, reason: string): void {
    this.api.put(`/admin/content/${contentId}/reject`, { reason })
      .subscribe({
        next: () => {
          this.loadContent();
        },
        error: (error) => {
          console.error('Error rejecting content:', error);
        }
      });
  }

  onDeleteContent(contentId: number): void {
    if (confirm('Are you sure you want to delete this content?')) {
      this.api.delete(`/admin/content/${contentId}`)
        .subscribe({
          next: () => {
            this.loadContent();
          },
          error: (error) => {
            console.error('Error deleting content:', error);
          }
        });
    }
  }

  toggleItemSelection(itemId: number): void {
    const index = this.selectedItems.indexOf(itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(itemId);
    }
    this.showBulkActions = this.selectedItems.length > 0;
  }

  selectAll(): void {
    this.selectedItems = this.filteredContent.map(item => item.id);
    this.showBulkActions = true;
  }

  deselectAll(): void {
    this.selectedItems = [];
    this.showBulkActions = false;
  }

  bulkApprove(): void {
    if (this.selectedItems.length === 0) return;
    
    const requests = this.selectedItems.map(id => 
      this.api.put(`/admin/content/${id}/approve`, {})
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loadContent();
        this.selectedItems = [];
        this.showBulkActions = false;
      })
      .catch(error => {
        console.error('Error in bulk approve:', error);
      });
  }

  bulkReject(): void {
    if (this.selectedItems.length === 0) return;
    
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const requests = this.selectedItems.map(id => 
      this.api.put(`/admin/content/${id}/reject`, { reason })
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loadContent();
        this.selectedItems = [];
        this.showBulkActions = false;
      })
      .catch(error => {
        console.error('Error in bulk reject:', error);
      });
  }

  bulkDelete(): void {
    if (this.selectedItems.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${this.selectedItems.length} items?`)) return;

    const requests = this.selectedItems.map(id => 
      this.api.delete(`/admin/content/${id}`)
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loadContent();
        this.selectedItems = [];
        this.showBulkActions = false;
      })
      .catch(error => {
        console.error('Error in bulk delete:', error);
      });
  }

  get paginatedContent(): ContentItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredContent.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredContent.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Add missing methods for template
  exportContent(): void {
    const headers = ['ID', 'Name', 'Category', 'Content Type', 'Status', 'Created At'];
    const rows = this.filteredContent.map(item => [
      item.id, 
      item.name, 
      item.category, 
      item.content_type || 'N/A',
      item.status || 'N/A',
      item.created_at
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  refreshData(): void {
    this.loadContent();
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onBulkAction(action: string): void {
    switch (action) {
      case 'approve':
        this.bulkApprove();
        break;
      case 'reject':
        this.bulkReject();
        break;
      case 'delete':
        this.bulkDelete();
        break;
    }
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectAll();
    } else {
      this.deselectAll();
    }
  }

  onContentSelect(itemId: number, checked: boolean): void {
    if (checked) {
      this.selectedItems.push(itemId);
    } else {
      this.selectedItems = this.selectedItems.filter(id => id !== itemId);
    }
    this.showBulkActions = this.selectedItems.length > 0;
  }

  onViewContent(content: ContentItem): void {
    this.selectedContent = content;
    this.showContentModal = true;
  }

  onPageChange(page: number): void {
    this.changePage(page);
  }

  // Fix type issues in template methods
  getContentPreview(content: string | undefined, contentType: string | undefined): string {
    if (!content) return 'No content';
    if (!contentType) return content.length > 100 ? content.substring(0, 100) + '...' : content;
    
    switch (contentType) {
      case 'text':
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
      case 'image':
        return '📷 Image Content';
      case 'video':
        return '🎥 Video Content';
      case 'audio':
        return '🎵 Audio Content';
      case 'document':
        return '📄 Document Content';
      default:
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
  }

  getContentTypeLabel(contentType: string | undefined): string {
    if (!contentType) return 'Unknown';
    const option = this.contentTypeOptions.find(opt => opt.value === contentType);
    return option ? option.label : contentType;
  }

  getContentTypeBadgeClass(contentType: string | undefined): string {
    if (!contentType) return 'bg-gray-100 text-gray-800';
    switch (contentType) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-yellow-100 text-yellow-800';
      case 'document': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
