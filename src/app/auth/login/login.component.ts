import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';
import { ScriptLoaderService } from '../../core/services/script-loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private scriptLoader: ScriptLoaderService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSavedEmail();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private setupFormSubscriptions(): void {
    // Watch for remember me changes
    this.loginForm.get('rememberMe')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(rememberMe => {
        if (!rememberMe) {
          localStorage.removeItem('soulsync_email');
        }
      });

    // Clear errors when form becomes valid
    this.loginForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status === 'VALID' && this.error) {
          this.clearError();
        }
      });
  }

  private loadSavedEmail(): void {
    const savedEmail = localStorage.getItem('soulsync_email');
    if (savedEmail) {
      this.loginForm.patchValue({ 
        email: savedEmail,
        rememberMe: true 
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInputFocus(fieldName: string): void {
    this.clearError();
  }

  onInputBlur(fieldName: string): void {
    // Handle blur events if needed
  }

  onSubmit(): void {
    if (this.loading || this.loginForm.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    const formValue = this.loginForm.value;
    
    // Save email if remember me is checked
    if (formValue.rememberMe) {
      localStorage.setItem('soulsync_email', formValue.email);
    } else {
      localStorage.removeItem('soulsync_email');
    }
    
    const loginRequest: LoginRequest = {
      email: formValue.email,
      password: formValue.password
    };
    
    this.authService.login(loginRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/app/dashboard']);
        },
        error: (error: any) => {
          this.error = this.getErrorMessage(error);
          this.loading = false;
        }
      });
  }

  async onGoogleLogin(): Promise<void> {
    if (this.loading) return;
    
    try {
      this.loading = true;
      this.error = '';
      
      const clientId = environment.social?.google?.clientId;
      if (!clientId) throw new Error('Google client ID not configured');
      
      await this.scriptLoader.load('https://accounts.google.com/gsi/client');
      
      // Use Google Identity Services One Tap / Prompt
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const token = response.credential;
          this.handleSocialLogin('google', token);
        }
      });
      
      // @ts-ignore
      google.accounts.id.prompt();
    } catch (e: any) {
      this.error = this.getErrorMessage(e);
      this.loading = false;
    }
  }

  async onFacebookLogin(): Promise<void> {
    if (this.loading) return;
    
    try {
      this.loading = true;
      this.error = '';
      
      const appId = environment.social?.facebook?.appId;
      if (!appId) throw new Error('Facebook App ID not configured');
      
      await this.scriptLoader.load('https://connect.facebook.net/en_US/sdk.js');
      
      // @ts-ignore
      window.fbAsyncInit = () => {
        // @ts-ignore
        FB.init({ 
          appId, 
          cookie: true, 
          xfbml: false, 
          version: 'v19.0' 
        });
        
        // @ts-ignore
        FB.login((response: any) => {
          if (response.authResponse) {
            const token = response.authResponse.accessToken;
            this.handleSocialLogin('facebook', token);
          } else {
            this.error = 'Facebook login failed or cancelled';
            this.loading = false;
          }
        }, { scope: 'email,public_profile' });
      };
    } catch (e: any) {
      this.error = this.getErrorMessage(e);
      this.loading = false;
    }
  }

  private handleSocialLogin(provider: string, token: string): void {
    this.authService.socialLogin(provider, token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/app/dashboard']);
        },
        error: (err: any) => {
          this.error = this.getErrorMessage(err);
          this.loading = false;
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 401) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error?.status === 429) {
      return 'Too many login attempts. Please wait a moment before trying again.';
    }
    if (error?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'Login failed. Please check your credentials and try again.';
  }

  clearError(): void {
    this.error = '';
  }

  // Getters for form controls
  get emailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get rememberMeControl(): FormControl {
    return this.loginForm.get('rememberMe') as FormControl;
  }

  get isFormValid(): boolean {
    return this.loginForm.valid && !this.loading;
  }

  get isFormDirty(): boolean {
    return this.loginForm.dirty;
  }

  get hasErrors(): boolean {
    return this.loginForm.invalid && this.loginForm.touched;
  }
} 