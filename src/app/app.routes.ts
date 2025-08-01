import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
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
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
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
        path: 'matches',
        loadComponent: () => import('./matches/match-suggestions/match-suggestions.component').then(m => m.MatchSuggestionsComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat-list/chat-list.component').then(m => m.ChatListComponent)
      },
      {
        path: 'chat/:conversationId',
        loadComponent: () => import('./chat/chat-box/chat-box.component').then(m => m.ChatBoxComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search-users/search-users.component').then(m => m.SearchUsersComponent)
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
        path: 'notifications',
        loadComponent: () => import('./notifications/notification/notification.component').then(m => m.NotificationComponent)
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
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent)
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
    loadComponent: () => import('./errors/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./errors/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
  },

  // Catch all route
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
