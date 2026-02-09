import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../core/services/auth.service';
import { GeolocationService } from '../core/services/geolocation.service';
import { LanguageSwitcherComponent } from '../shared/components/language-switcher/language-switcher.component';
import { TopLiveProfilesComponent } from '../shared/components/top-live-profiles/top-live-profiles.component';
import { SuccessStoriesCarouselComponent } from '../shared/components/success-stories-carousel/success-stories-carousel.component';
import { TrustBadgesComponent } from '../shared/components/trust-badges/trust-badges.component';
import { RecentlyJoinedComponent } from '../shared/components/recently-joined/recently-joined.component';
import { SearchByCategoryComponent } from '../shared/components/search-by-category/search-by-category.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    LanguageSwitcherComponent,
    TopLiveProfilesComponent,
    SuccessStoriesCarouselComponent,
    TrustBadgesComponent,
    RecentlyJoinedComponent,
    SearchByCategoryComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated = signal(false);
  isMobileMenuOpen = false;
  openFaqIndex: number | null = null;
  isScrolled = false;
  private isBrowser: boolean;
  private authSub?: Subscription;

  // Pricing data from API
  plans: any[] = [];
  currencySymbol = 'LKR';
  loadingPlans = true;

  constructor(
    private authService: AuthService,
    private geolocationService: GeolocationService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.authSub = this.authService.isAuthenticated$.subscribe(
      (isAuth) => this.isAuthenticated.set(isAuth)
    );
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isBrowser) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  ngOnInit(): void {
    // Check initial scroll position
    if (this.isBrowser) {
      this.isScrolled = window.scrollY > 50;
    }
    // Load pricing plans from API
    this.loadPlans();
  }

  private loadPlans(): void {
    // Force fresh country detection instead of using cached localStorage value
    this.geolocationService.detectCountry().subscribe({
      next: () => {
        // Now fetch plans with freshly detected country
        this.geolocationService.getPricingForCountry().subscribe({
          next: (pricing) => {
            this.plans = pricing.plans || [];
            this.currencySymbol = pricing.currencySymbol || 'Rs.';
            this.loadingPlans = false;
          },
          error: () => {
            this.loadingPlans = false;
          }
        });
      },
      error: () => {
        // If detection fails, still try to get plans with default
        this.geolocationService.getPricingForCountry().subscribe({
          next: (pricing) => {
            this.plans = pricing.plans || [];
            this.currencySymbol = pricing.currencySymbol || 'Rs.';
            this.loadingPlans = false;
          },
          error: () => {
            this.loadingPlans = false;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
