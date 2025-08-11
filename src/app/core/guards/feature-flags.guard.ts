import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AdminSettingsService } from '../services/admin-settings.service';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsGuard implements CanActivate {
  constructor(private router: Router, private adminSettings: AdminSettingsService) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const flag = route.data['featureFlag'] as string | undefined;
    if (!flag) return true;
    const segments = flag.split('.');
    // merge environment flags with admin-provided flags if any
    const admin = this.adminSettings.value as any;
    const merged = { ...environment.features, ...(admin?.features || {}) } as any;
    let value: any = merged;
    for (const s of segments) {
      value = value?.[s];
    }
    if (value === true) return true;
    return this.router.parseUrl('/unauthorized');
  }
}

