import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  profile_completion: number;
  subscription_status: 'free' | 'basic' | 'premium';
  status: 'active' | 'suspended' | 'banned';
  last_active: string;
  created_at: string;
  matches_count: number;
  reports_count: number;
}

interface UserFilters {
  search: string;
  status: string;
  subscription: string;
  profile_completion: string;
  date_range: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  error = '';
  
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: number[] = [];
  
  filters: UserFilters = {
    search: '',
    status: '',
    subscription: '',
    profile_completion: '',
    date_range: ''
  };
  
  filterForm: FormGroup;
  
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  
  showBulkActions = false;
  showUserModal = false;
  selectedUser: User | null = null;
  
  // Add Math property for template access
  Math = Math;

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'banned', label: 'Banned' }
  ];
  
  subscriptionOptions = [
    { value: '', label: 'All Subscriptions' },
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic' },
    { value: 'premium', label: 'Premium' }
  ];
  
  completionOptions = [
    { value: '', label: 'All Completion' },
    { value: '0-25', label: '0-25%' },
    { value: '26-50', label: '26-50%' },
    { value: '51-75', label: '51-75%' },
    { value: '76-100', label: '76-100%' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private api: ApiService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      subscription: [''],
      profile_completion: [''],
      date_range: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
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

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.api.get<any>('/admin/users')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.users = res.data || [];
            this.totalItems = this.users.length;
            this.applyFilters();
            this.loading = false;
          } else {
            this.error = res.message || 'Failed to load users';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.message || 'Failed to load users';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const searchMatch = !this.filters.search || 
        user.first_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(this.filters.search.toLowerCase());
      
      const statusMatch = !this.filters.status || user.status === this.filters.status;
      const subscriptionMatch = !this.filters.subscription || user.subscription_status === this.filters.subscription;
      
      let completionMatch = true;
      if (this.filters.profile_completion) {
        const [min, max] = this.filters.profile_completion.split('-').map(Number);
        completionMatch = user.profile_completion >= min && user.profile_completion <= max;
      }
      
      return searchMatch && statusMatch && subscriptionMatch && completionMatch;
    });
    
    this.currentPage = 1;
    this.totalItems = this.filteredUsers.length;
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onUserSelect(userId: number, checked: boolean): void {
    if (checked) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    }
    this.showBulkActions = this.selectedUsers.length > 0;
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedUsers = this.paginatedUsers.map(user => user.id);
    } else {
      this.selectedUsers = [];
    }
    this.showBulkActions = this.selectedUsers.length > 0;
  }

  onViewUser(user: User): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  onSuspendUser(userId: number): void {
    if (confirm('Are you sure you want to suspend this user?')) {
      this.api.post<any>(`/admin/users/${userId}/suspend`, { reason: 'policy_violation', duration_days: 7 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: () => this.loadUsers(), error: () => this.loadUsers() });
    }
  }

  onBanUser(userId: number): void {
    if (confirm('Are you sure you want to ban this user? This action cannot be undone.')) {
      this.api.post<any>(`/admin/users/${userId}/ban`, { reason: 'policy_violation' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: () => this.loadUsers(), error: () => this.loadUsers() });
    }
  }

  onDeleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.api.delete<any>(`/admin/users/${userId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: () => this.loadUsers(), error: () => this.loadUsers() });
    }
  }

  onBulkAction(action: string): void {
    if (this.selectedUsers.length === 0) return;

    const actionText = action === 'suspend' ? 'suspend' : 
                      action === 'ban' ? 'ban' : 'delete';
    
    if (confirm(`Are you sure you want to ${actionText} ${this.selectedUsers.length} users?`)) {
      const calls = this.selectedUsers.map(id => action === 'delete'
        ? this.api.delete<any>(`/admin/users/${id}`)
        : this.api.post<any>(`/admin/users/${id}/${action}`, { reason: 'bulk_action', duration_days: action === 'suspend' ? 7 : undefined }));
      calls.reduce((p, req) => p.then(() => req.toPromise()), Promise.resolve()).finally(() => {
        this.selectedUsers = [];
        this.showBulkActions = false;
        this.loadUsers();
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSubscriptionBadgeClass(subscription: string): string {
    switch (subscription) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatLastActive(date: string): string {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  exportUsers(): void {
    // Export functionality
    // Export users to CSV or Excel format
    // Implementation would generate and download user data
  }

  refreshData(): void {
    this.loadUsers();
  }
}
