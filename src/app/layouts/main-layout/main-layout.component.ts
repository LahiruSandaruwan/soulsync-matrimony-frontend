import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  unreadNotifications = 0;
  showUserMenu = false;
  showMobileMenu = false;
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  getProfilePhoto(): string {
    if (this.currentUser?.profile?.photos?.length) {
      const primaryPhoto = this.currentUser.profile.photos.find(photo => photo.is_primary);
      return primaryPhoto?.file_path || this.currentUser.profile.photos[0].file_path;
    }
    return '';
  }

  getInitials(): string {
    if (this.currentUser) {
      return `${this.currentUser.first_name.charAt(0)}${this.currentUser.last_name.charAt(0)}`.toUpperCase();
    }
    return '';
  }
}
