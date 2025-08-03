import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
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
    private authService: AuthService
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

    // Mock data - replace with actual API call
    setTimeout(() => {
      this.reports = [
        {
          id: 1,
          reporter_id: 1,
          reported_user_id: 2,
          report_type: 'harassment',
          reason: 'User sent inappropriate messages repeatedly',
          evidence: 'Screenshots of messages provided',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reporter: { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com' },
          reported_user: { first_name: 'Bob', last_name: 'Wilson', email: 'bob@example.com' }
        },
        {
          id: 2,
          reporter_id: 3,
          reported_user_id: 4,
          report_type: 'fake_profile',
          reason: 'Profile photos appear to be fake or stolen',
          evidence: 'Reverse image search results',
          status: 'investigating',
          admin_notes: 'Under investigation - checking image sources',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          reporter: { first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com' },
          reported_user: { first_name: 'Diana', last_name: 'Smith', email: 'diana@example.com' }
        },
        {
          id: 3,
          reporter_id: 5,
          reported_user_id: 6,
          report_type: 'spam',
          reason: 'User sending promotional messages',
          evidence: 'Multiple spam messages in chat',
          status: 'resolved',
          admin_notes: 'User warned and messages removed',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          reporter: { first_name: 'Eve', last_name: 'Davis', email: 'eve@example.com' },
          reported_user: { first_name: 'Frank', last_name: 'Miller', email: 'frank@example.com' }
        }
      ];
      
      this.totalItems = this.reports.length;
      this.applyFilters();
      this.loading = false;
    }, 1000);
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
    // API call to update report status
    console.log('Updating report status:', reportId, status);
    this.loadReports();
  }

  onAddNote(reportId: number, note: string): void {
    // API call to add admin note
    console.log('Adding note to report:', reportId, note);
    this.loadReports();
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
      // API call for bulk action
      console.log(`Bulk ${action}:`, this.selectedReports);
      this.selectedReports = [];
      this.showBulkActions = false;
      this.loadReports();
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
    // Export functionality
    console.log('Exporting reports');
  }

  refreshData(): void {
    this.loadReports();
  }
}
