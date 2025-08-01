import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';

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
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.error = error.message || 'Login failed';
        this.loading = false;
      }
    });
  }
} 