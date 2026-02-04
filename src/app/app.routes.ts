import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { FeatureFlagsGuard } from './core/guards/feature-flags.guard';

export const routes: Routes = [
  // Public Homepage
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },

  // Public Success Stories Routes
  {
    path: 'success-stories',
    loadComponent: () => import('./success-stories/success-stories-list/success-stories-list.component').then(m => m.SuccessStoriesListComponent)
  },
  {
    path: 'success-stories/:id',
    loadComponent: () => import('./success-stories/success-story-detail/success-story-detail.component').then(m => m.SuccessStoryDetailComponent)
  },

  // Auth Routes
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Main App Routes (Protected)
  {
    path: 'app',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
      },
      {
        path: 'profile/photos',
        loadComponent: () => import('./profile/photo-upload/photo-upload.component').then(m => m.PhotoUploadComponent)
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'matches',
        loadComponent: () => import('./match/match-suggestions/match-suggestions.component').then(m => m.MatchSuggestionsComponent)
      },
      { path: 'horoscope', loadComponent: () => import('./horoscope/horoscope.component').then(m => m.HoroscopeComponent) },
      { path: 'insights', loadComponent: () => import('./insights/insights.component').then(m => m.InsightsComponent), canActivate: [FeatureFlagsGuard], data: { featureFlag: 'premiumFeatures' } },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat-list/chat-list.component').then(m => m.ChatListComponent),
        canActivate: [FeatureFlagsGuard],
        data: { featureFlag: 'chat' }
      },
      {
        path: 'chat/:conversationId',
        loadComponent: () => import('./chat/chat-box/chat-box.component').then(m => m.ChatBoxComponent),
        canActivate: [FeatureFlagsGuard],
        data: { featureFlag: 'chat' }
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search-users/search-users.component').then(m => m.SearchUsersComponent)
      },
      {
        path: 'browse',
        loadComponent: () => import('./browse/browse-list/browse-list.component').then(m => m.BrowseListComponent)
      },
      {
        path: 'browse/premium',
        loadComponent: () => import('./browse/browse-premium/browse-premium.component').then(m => m.BrowsePremiumComponent)
      },
      {
        path: 'browse/recent',
        loadComponent: () => import('./browse/browse-recent/browse-recent.component').then(m => m.BrowseRecentComponent)
      },
      {
        path: 'browse/verified',
        loadComponent: () => import('./browse/browse-verified/browse-verified.component').then(m => m.BrowseVerifiedComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./subscription/subscription-plans/subscription-plans.component').then(m => m.SubscriptionPlansComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
      },
      {
        path: '2fa',
        loadComponent: () => import('./auth/two-factor/two-factor.component').then(m => m.TwoFactorComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notification/notification.component').then(m => m.NotificationComponent)
      },
      {
        path: 'submit-story',
        loadComponent: () => import('./success-stories/success-story-submit/success-story-submit.component').then(m => m.SuccessStorySubmitComponent)
      },
      {
        path: 'video-call/:callId',
        loadComponent: () => import('./chat/video-call/video-call.component').then(m => m.VideoCallComponent),
        canActivate: [FeatureFlagsGuard],
        data: { featureFlag: 'videoCalls' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Admin Routes (Protected with Role Guard)
  {
    path: 'admin',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'super-admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/report-management/report-management.component').then(m => m.ReportManagementComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./admin/content-management/content-management.component').then(m => m.ContentManagementComponent)
      },
      {
        path: 'pricing',
        loadComponent: () => import('./admin/pricing-management/pricing-management.component').then(m => m.PricingManagementComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'success-stories',
        loadComponent: () => import('./admin/success-stories-management/success-stories-management.component').then(m => m.SuccessStoriesManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Error Pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./error/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./error/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
  },

  // Catch all route
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
