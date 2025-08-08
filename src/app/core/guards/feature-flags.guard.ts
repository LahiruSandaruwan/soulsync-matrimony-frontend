import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const flag = route.data['featureFlag'] as string | undefined;
    if (!flag) return true;
    const segments = flag.split('.');
    let value: any = environment.features as any;
    for (const s of segments) {
      value = value?.[s];
    }
    if (value === true) return true;
    return this.router.parseUrl('/unauthorized');
  }
}

