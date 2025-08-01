import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  profile: any = {
    firstName: 'John',
    lastName: 'Doe',
    age: 28,
    location: 'New York, NY',
    bio: 'Looking for someone special to share life\'s adventures with.',
    photos: []
  };

  constructor() {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // TODO: Load profile data from service
  }
} 