import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const requiredRoles = route.data['roles'] as Array<string>;
        
        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const hasRequiredRole = requiredRoles.some(role => 
          this.authService.hasRole(role)
        );

        if (hasRequiredRole) {
          return true;
        } else {
          // Redirect to unauthorized page or dashboard
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }
} 