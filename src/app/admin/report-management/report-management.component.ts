import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface Report {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  report_type: 'inappropriate_content' | 'harassment' | 'fake_profile' | 'spam' | 'other';
  reason: string;
  evidence?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  reporter?: any;
  reported_user?: any;
}

interface ReportFilters {
  search: string;
  status: string;
  report_type: string;
  date_range: string;
}

@Component({
  selector: 'app-report-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './report-management.component.html',
  styleUrls: ['./report-management.component.scss']
})
export class ReportManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  
  reports: Report[] = [];
  filteredReports: Report[] = [];
  selectedReports: number[] = [];
  
  filters: ReportFilters = {
    search: '',
    status: '',
    report_type: '',
    date_range: ''
  };
  
  filterForm: FormGroup;
  
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  
  showBulkActions = false;
  showReportModal = false;
  selectedReport: Report | null = null;
  
  // Add Math property for template access
  Math = Math;

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
  ];
  
  reportTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'fake_profile', label: 'Fake Profile' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private api: ApiService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      report_type: [''],
      date_range: ['']
    });
  }

  ngOnInit(): void {
    this.loadReports();
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

  loadReports(): void {
    this.loading = true;
    this.error = '';
    this.api.get<any>('/admin/reports')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.reports = res.data || [];
            this.totalItems = this.reports.length;
            this.applyFilters();
            this.loading = false;
          } else {
            this.error = res.message || 'Failed to load reports';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.message || 'Failed to load reports';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredReports = this.reports.filter(report => {
      const searchMatch = !this.filters.search || 
        report.reason.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        report.reporter?.first_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        report.reported_user?.first_name.toLowerCase().includes(this.filters.search.toLowerCase());
      
      const statusMatch = !this.filters.status || report.status === this.filters.status;
      const typeMatch = !this.filters.report_type || report.report_type === this.filters.report_type;
      
      return searchMatch && statusMatch && typeMatch;
    });
    
    this.currentPage = 1;
    this.totalItems = this.filteredReports.length;
  }

  get paginatedReports(): Report[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredReports.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onReportSelect(reportId: number, checked: boolean): void {
    if (checked) {
      this.selectedReports.push(reportId);
    } else {
      this.selectedReports = this.selectedReports.filter(id => id !== reportId);
    }
    this.showBulkActions = this.selectedReports.length > 0;
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedReports = this.paginatedReports.map(report => report.id);
    } else {
      this.selectedReports = [];
    }
    this.showBulkActions = this.selectedReports.length > 0;
  }

  onViewReport(report: Report): void {
    this.selectedReport = report;
    this.showReportModal = true;
  }

  onUpdateStatus(reportId: number, status: string): void {
    this.api.put<any>(`/admin/reports/${reportId}/status`, { status })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadReports(), error: () => this.loadReports() });
  }

  onAddNote(reportId: number, note: string): void {
    this.api.post<any>(`/admin/reports/${reportId}/action`, { action: 'warn', action_details: note })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.loadReports(), error: () => this.loadReports() });
  }

  onResolveReport(reportId: number): void {
    if (confirm('Are you sure you want to resolve this report?')) {
      this.onUpdateStatus(reportId, 'resolved');
    }
  }

  onDismissReport(reportId: number): void {
    if (confirm('Are you sure you want to dismiss this report?')) {
      this.onUpdateStatus(reportId, 'dismissed');
    }
  }

  onBulkAction(action: string): void {
    if (this.selectedReports.length === 0) return;

    const actionText = action === 'resolve' ? 'resolve' : 'dismiss';
    
    if (confirm(`Are you sure you want to ${actionText} ${this.selectedReports.length} reports?`)) {
      const requests = this.selectedReports.map(id => 
        this.api.put<any>(`/admin/reports/${id}/status`, { 
          status: action === 'resolve' ? 'resolved' : 'dismissed' 
        })
      );
      
      // Execute all requests in parallel
      forkJoin(requests).subscribe({
        next: () => {
          this.selectedReports = [];
          this.showBulkActions = false;
          this.loadReports();
        },
        error: () => {
          this.selectedReports = [];
          this.showBulkActions = false;
          this.loadReports();
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getReportTypeBadgeClass(type: string): string {
    switch (type) {
      case 'harassment': return 'bg-red-100 text-red-800';
      case 'inappropriate_content': return 'bg-orange-100 text-orange-800';
      case 'fake_profile': return 'bg-purple-100 text-purple-800';
      case 'spam': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
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

  getReportTypeLabel(type: string): string {
    const option = this.reportTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  exportReports(): void {
    // Simple CSV export client-side
    const headers = ['ID','Type','Reason','Status','Reporter','Reported','Created At'];
    const rows = this.filteredReports.map(r => [r.id, r.report_type, JSON.stringify(r.reason).replaceAll('"','""'), r.status, `${r.reporter?.first_name||''} ${r.reporter?.last_name||''}`, `${r.reported_user?.first_name||''} ${r.reported_user?.last_name||''}`, r.created_at]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reports.csv'; a.click(); URL.revokeObjectURL(url);
  }

  refreshData(): void {
    this.loadReports();
  }
}
