import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  currentUser: User | null = null;
  newMatches = 0;
  unreadMessages = 0;
  profileViews = 0;
  recentActivities: Activity[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Mock data for demonstration
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Mock data - in real app, this would come from API
    this.newMatches = 5;
    this.unreadMessages = 12;
    this.profileViews = 23;

    this.recentActivities = [
      {
        icon: '❤️',
        title: 'New Match',
        description: 'You matched with Sarah!',
        time: '2 hours ago'
      },
      {
        icon: '💬',
        title: 'New Message',
        description: 'John sent you a message',
        time: '4 hours ago'
      },
      {
        icon: '👀',
        title: 'Profile View',
        description: 'Someone viewed your profile',
        time: '6 hours ago'
      },
      {
        icon: '⭐',
        title: 'Super Like',
        description: 'You received a super like!',
        time: '1 day ago'
      }
    ];
  }
}
