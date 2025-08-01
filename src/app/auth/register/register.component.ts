import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: RegisterRequest = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    date_of_birth: '',
    gender: 'male',
    country_code: '+94',
    terms_accepted: false,
    privacy_accepted: false
  };
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerForm.password !== this.registerForm.password_confirmation) {
      this.error = 'Passwords do not match';
      return;
    }

    if (!this.registerForm.terms_accepted || !this.registerForm.privacy_accepted) {
      this.error = 'Please agree to the terms and conditions and privacy policy';
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.authService.register(this.registerForm).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error: any) => {
        this.error = error.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
} 