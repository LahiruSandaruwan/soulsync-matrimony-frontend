import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';
import { ScriptLoaderService } from '../../core/services/script-loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: LoginRequest = {
    email: '',
    password: ''
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private scriptLoader: ScriptLoaderService
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.error = error.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  async onGoogleLogin(): Promise<void> {
    try {
      const clientId = environment.social.google.clientId;
      if (!clientId) throw new Error('Google client ID not configured');
      await this.scriptLoader.load('https://accounts.google.com/gsi/client');
      // Use Google Identity Services One Tap / Prompt
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const token = response.credential;
          this.authService.socialLogin('google', token).subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: (err: any) => this.error = err.message || 'Google login failed'
          });
        }
      });
      // @ts-ignore
      google.accounts.id.prompt();
    } catch (e: any) {
      this.error = e.message || 'Google login not available';
    }
  }

  async onFacebookLogin(): Promise<void> {
    try {
      const appId = environment.social.facebook.appId;
      if (!appId) throw new Error('Facebook App ID not configured');
      await this.scriptLoader.load('https://connect.facebook.net/en_US/sdk.js');
      // @ts-ignore
      window.fbAsyncInit = () => {
        // @ts-ignore
        FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
        // @ts-ignore
        FB.login((response: any) => {
          if (response.authResponse) {
            const token = response.authResponse.accessToken;
            this.authService.socialLogin('facebook', token).subscribe({
              next: () => this.router.navigate(['/dashboard']),
              error: (err: any) => this.error = err.message || 'Facebook login failed'
            });
          } else {
            this.error = 'Facebook login failed or cancelled';
          }
        }, { scope: 'email,public_profile' });
      };
    } catch (e: any) {
      this.error = e.message || 'Facebook login not available';
    }
  }
} 