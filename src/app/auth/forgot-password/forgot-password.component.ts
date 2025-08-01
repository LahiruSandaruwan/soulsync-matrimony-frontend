import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  success = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    const request: ForgotPasswordRequest = { email: this.email };
    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to send reset email';
        this.loading = false;
      }
    });
  }
} 