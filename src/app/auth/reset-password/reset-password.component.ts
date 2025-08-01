import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ResetPasswordRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetForm: ResetPasswordRequest = {
    token: '',
    email: '',
    password: '',
    password_confirmation: ''
  };
  loading = false;
  error = '';
  success = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm.token = this.route.snapshot.queryParams['token'] || '';
    this.resetForm.email = this.route.snapshot.queryParams['email'] || '';
  }

  onSubmit(): void {
    if (this.resetForm.password !== this.resetForm.password_confirmation) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.authService.resetPassword(this.resetForm).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to reset password';
        this.loading = false;
      }
    });
  }
} 