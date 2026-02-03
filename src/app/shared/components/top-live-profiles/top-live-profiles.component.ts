import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LiveProfileCardComponent, LiveProfile } from '../live-profile-card/live-profile-card.component';
import { BrowseService } from '../../../core/services/browse.service';

@Component({
  selector: 'app-top-live-profiles',
  standalone: true,
  imports: [CommonModule, LiveProfileCardComponent],
  templateUrl: './top-live-profiles.component.html',
  styleUrls: ['./top-live-profiles.component.scss']
})
export class TopLiveProfilesComponent implements OnInit, OnDestroy {
  profiles: LiveProfile[] = [];
  loading = true;
  error = '';

  private destroy$ = new Subject<void>();

  constructor(
    private browseService: BrowseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLiveProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLiveProfiles(): void {
    this.loading = true;
    this.error = '';

    this.browseService.getLiveProfiles(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profiles) => {
          this.profiles = profiles;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load live profiles';
          this.loading = false;
          console.error('Error loading live profiles:', err);
        }
      });
  }

  onViewProfile(profileId: number): void {
    this.router.navigate(['/app/profile', profileId]);
  }

  // Generate array for skeleton loader
  get skeletonItems(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
