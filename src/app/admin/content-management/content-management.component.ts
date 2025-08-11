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
    this.api.get<any>('/admin/content/interests')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.contentItems = (res.data || []).map((i: any) => ({
              id: i.id,
              name: i.name,
              category: i.category,
              description: i.description,
              created_at: i.created_at,
              updated_at: i.updated_at
            }));
            this.totalItems = this.contentItems.length;
            this.applyFilters();
            this.loading = false;
          } else {
            this.error = res.message || 'Failed to load content';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.message || 'Failed to load content';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredContent = this.contentItems.filter(item => {
      const searchMatch = !this.filters.search || 
        item.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(this.filters.search.toLowerCase());
      const categoryMatch = !this.filters.category || item.category === this.filters.category;
      return searchMatch && categoryMatch;
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

  onCreateInterest(data: { name: string; category: string; description?: string }): void {
    this.api.post<any>('/admin/content/interests', data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadContent(), error: () => this.loadContent() });
  }

  onUpdateInterest(itemId: number, data: { name?: string; category?: string; description?: string }): void {
    this.api.put<any>(`/admin/content/interests/${itemId}`, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadContent(), error: () => this.loadContent() });
  }

  onDeleteInterest(itemId: number): void {
    if (!confirm('Are you sure you want to delete this interest?')) return;
    this.api.delete<any>(`/admin/content/interests/${itemId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadContent(), error: () => this.loadContent() });
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

  getContentPreview(desc?: string): string {
    const content = desc || '';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  exportContent(): void {
    const headers = ['ID','Name','Category','Description','Created At'];
    const rows = this.filteredContent.map(i => [i.id, i.name, i.category, (i.description||'').replaceAll('"','""'), i.created_at]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'interests.csv'; a.click(); URL.revokeObjectURL(url);
  }

  refreshData(): void {
    this.loadContent();
  }
}
