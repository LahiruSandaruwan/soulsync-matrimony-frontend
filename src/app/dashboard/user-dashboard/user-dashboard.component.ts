import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  stats = {
    totalMatches: 0,
    newMessages: 0,
    profileViews: 0,
    activeSubscriptions: 0
  };

  recentMatches: any[] = [];
  recentMessages: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Load dashboard data from services
    this.stats = {
      totalMatches: 25,
      newMessages: 8,
      profileViews: 45,
      activeSubscriptions: 1
    };
  }
} 