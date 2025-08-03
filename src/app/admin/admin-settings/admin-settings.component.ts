import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_email: string;
  max_photos_per_user: number;
  max_message_length: number;
  auto_approve_profiles: boolean;
  require_email_verification: boolean;
  allow_guest_browsing: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: 'tls' | 'ssl' | 'none';
  from_email: string;
  from_name: string;
}

interface PaymentSettings {
  stripe_public_key: string;
  stripe_secret_key: string;
  paypal_client_id: string;
  paypal_secret: string;
  currency: string;
  subscription_plans: any[];
}

interface SecuritySettings {
  password_min_length: number;
  require_special_chars: boolean;
  require_numbers: boolean;
  require_uppercase: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  session_timeout: number;
  two_factor_required: boolean;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = true;
  saving = false;
  error = '';
  success = '';
  
  activeTab = 'site';
  
  siteForm: FormGroup;
  emailForm: FormGroup;
  paymentForm: FormGroup;
  securityForm: FormGroup;
  
  siteSettings: SiteSettings = {
    site_name: 'Soulsync Matrimony',
    site_description: 'Find your perfect match',
    contact_email: 'contact@soulsync.com',
    support_email: 'support@soulsync.com',
    max_photos_per_user: 10,
    max_message_length: 1000,
    auto_approve_profiles: false,
    require_email_verification: true,
    allow_guest_browsing: false,
    maintenance_mode: false,
    maintenance_message: 'Site is under maintenance. Please check back later.'
  };
  
  emailSettings: EmailSettings = {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: 'noreply@soulsync.com',
    from_name: 'Soulsync Matrimony'
  };
  
  paymentSettings: PaymentSettings = {
    stripe_public_key: '',
    stripe_secret_key: '',
    paypal_client_id: '',
    paypal_secret: '',
    currency: 'USD',
    subscription_plans: []
  };
  
  securitySettings: SecuritySettings = {
    password_min_length: 8,
    require_special_chars: true,
    require_numbers: true,
    require_uppercase: true,
    max_login_attempts: 5,
    lockout_duration: 15,
    session_timeout: 60,
    two_factor_required: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.siteForm = this.fb.group({
      site_name: ['', Validators.required],
      site_description: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      support_email: ['', [Validators.required, Validators.email]],
      max_photos_per_user: [10, [Validators.required, Validators.min(1), Validators.max(20)]],
      max_message_length: [1000, [Validators.required, Validators.min(100), Validators.max(5000)]],
      auto_approve_profiles: [false],
      require_email_verification: [true],
      allow_guest_browsing: [false],
      maintenance_mode: [false],
      maintenance_message: ['']
    });

    this.emailForm = this.fb.group({
      smtp_host: ['', Validators.required],
      smtp_port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtp_username: ['', Validators.required],
      smtp_password: ['', Validators.required],
      smtp_encryption: ['tls', Validators.required],
      from_email: ['', [Validators.required, Validators.email]],
      from_name: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      stripe_public_key: [''],
      stripe_secret_key: [''],
      paypal_client_id: [''],
      paypal_secret: [''],
      currency: ['USD', Validators.required]
    });

    this.securityForm = this.fb.group({
      password_min_length: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      require_special_chars: [true],
      require_numbers: [true],
      require_uppercase: [true],
      max_login_attempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      lockout_duration: [15, [Validators.required, Validators.min(5), Validators.max(60)]],
      session_timeout: [60, [Validators.required, Validators.min(15), Validators.max(1440)]],
      two_factor_required: [false]
    });
  }

  loadSettings(): void {
    this.loading = true;
    this.error = '';

    // Mock data - replace with actual API call
    setTimeout(() => {
      this.populateForms();
      this.loading = false;
    }, 1000);
  }

  private populateForms(): void {
    this.siteForm.patchValue(this.siteSettings);
    this.emailForm.patchValue(this.emailSettings);
    this.paymentForm.patchValue(this.paymentSettings);
    this.securityForm.patchValue(this.securitySettings);
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
  }

  onSaveSiteSettings(): void {
    if (this.siteForm.valid) {
      this.saving = true;
      this.error = '';
      
      const settings = this.siteForm.value;
      
      // API call to save site settings
      setTimeout(() => {
        this.siteSettings = { ...this.siteSettings, ...settings };
        this.success = 'Site settings saved successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 1000);
    }
  }

  onSaveEmailSettings(): void {
    if (this.emailForm.valid) {
      this.saving = true;
      this.error = '';
      
      const settings = this.emailForm.value;
      
      // API call to save email settings
      setTimeout(() => {
        this.emailSettings = { ...this.emailSettings, ...settings };
        this.success = 'Email settings saved successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 1000);
    }
  }

  onSavePaymentSettings(): void {
    if (this.paymentForm.valid) {
      this.saving = true;
      this.error = '';
      
      const settings = this.paymentForm.value;
      
      // API call to save payment settings
      setTimeout(() => {
        this.paymentSettings = { ...this.paymentSettings, ...settings };
        this.success = 'Payment settings saved successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 1000);
    }
  }

  onSaveSecuritySettings(): void {
    if (this.securityForm.valid) {
      this.saving = true;
      this.error = '';
      
      const settings = this.securityForm.value;
      
      // API call to save security settings
      setTimeout(() => {
        this.securitySettings = { ...this.securitySettings, ...settings };
        this.success = 'Security settings saved successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 1000);
    }
  }

  onTestEmail(): void {
    if (this.emailForm.valid) {
      this.saving = true;
      this.error = '';
      
      // API call to test email configuration
      setTimeout(() => {
        this.success = 'Test email sent successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 2000);
    }
  }

  onClearCache(): void {
    if (confirm('Are you sure you want to clear all caches? This may temporarily slow down the site.')) {
      this.saving = true;
      this.error = '';
      
      // API call to clear cache
      setTimeout(() => {
        this.success = 'Cache cleared successfully!';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      }, 2000);
    }
  }

  onBackupDatabase(): void {
    this.saving = true;
    this.error = '';
    
    // API call to backup database
    setTimeout(() => {
      this.success = 'Database backup completed successfully!';
      this.saving = false;
      setTimeout(() => this.success = '', 3000);
    }, 3000);
  }

  onToggleMaintenanceMode(): void {
    const currentMode = this.siteForm.get('maintenance_mode')?.value;
    const newMode = !currentMode;
    
    this.siteForm.patchValue({ maintenance_mode: newMode });
    
    if (newMode) {
      this.success = 'Maintenance mode enabled. Site is now in maintenance mode.';
    } else {
      this.success = 'Maintenance mode disabled. Site is now live.';
    }
    
    setTimeout(() => this.success = '', 3000);
  }

  getTabClass(tab: string): string {
    return this.activeTab === tab 
      ? 'bg-blue-100 border-blue-500 text-blue-700' 
      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';
  }

  getFormStatus(form: FormGroup): string {
    if (form.valid) {
      return 'Valid';
    } else if (form.dirty) {
      return 'Invalid';
    } else {
      return 'Unchanged';
    }
  }

  getFormStatusClass(form: FormGroup): string {
    const status = this.getFormStatus(form);
    switch (status) {
      case 'Valid': return 'text-green-600';
      case 'Invalid': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }
} 