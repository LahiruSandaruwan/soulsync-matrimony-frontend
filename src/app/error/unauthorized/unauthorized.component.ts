import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent implements OnInit {
  
  userEmail: string = '';
  isLoggedIn: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in and get their email
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userEmail = user?.email || '';
    });
  }
  
  /**
   * Navigate back to the previous page
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.goHome();
    }
  }
  
  /**
   * Navigate to appropriate home page based on user status
   */
  goHome(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
  
  /**
   * Logout current user and redirect to login
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
  
  /**
   * Contact support about access issues
   */
  contactSupport(): void {
    const subject = encodeURIComponent('Access Request - Unauthorized Page');
    const body = encodeURIComponent(`
Hello SoulSync Support Team,

I am experiencing unauthorized access issues on your platform.

User Email: ${this.userEmail}
Current Page: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please help me resolve this access issue.

Thank you,
${this.userEmail || 'User'}
    `);
    
    const mailtoLink = `mailto:support@soulsync.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  }
  
  /**
   * Request admin access
   */
  requestAdminAccess(): void {
    const subject = encodeURIComponent('Admin Access Request');
    const body = encodeURIComponent(`
Hello SoulSync Admin Team,

I would like to request admin access to the platform.

User Email: ${this.userEmail}
Reason for Access: [Please describe your reason]
Timestamp: ${new Date().toISOString()}

Thank you for your consideration.

Best regards,
${this.userEmail || 'User'}
    `);
    
    const mailtoLink = `mailto:admin@soulsync.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  }
}
