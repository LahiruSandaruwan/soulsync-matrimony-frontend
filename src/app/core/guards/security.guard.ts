import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityGuard implements CanActivate, CanActivateChild {

  constructor(
    private securityService: SecurityService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkSecurity(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkSecurity(childRoute, state);
  }

  private checkSecurity(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Check for required security level
    const requiredSecurityLevel = route.data['securityLevel'] || 'basic';
    
    return this.performSecurityChecks(requiredSecurityLevel, state.url)
      .pipe(
        map(result => {
          if (!result.allowed) {
            this.handleSecurityViolation(result.reason, state.url);
            return false;
          }
          return true;
        }),
        catchError(() => {
          this.router.navigate(['/error/security']);
          return of(false);
        })
      );
  }

  private performSecurityChecks(
    requiredLevel: string, 
    url: string
  ): Observable<{ allowed: boolean; reason?: string }> {
    
    return new Observable(observer => {
      // Basic security checks
      const basicChecks = this.performBasicSecurityChecks();
      if (!basicChecks.passed) {
        observer.next({ allowed: false, reason: basicChecks.reason });
        observer.complete();
        return;
      }

      // Enhanced security checks for sensitive routes
      if (requiredLevel === 'high') {
        const enhancedChecks = this.performEnhancedSecurityChecks();
        if (!enhancedChecks.passed) {
          observer.next({ allowed: false, reason: enhancedChecks.reason });
          observer.complete();
          return;
        }
      }

      // Admin-level security checks
      if (requiredLevel === 'admin') {
        this.performAdminSecurityChecks().then(adminChecks => {
          if (!adminChecks.passed) {
            observer.next({ allowed: false, reason: adminChecks.reason });
          } else {
            observer.next({ allowed: true });
          }
          observer.complete();
        });
        return;
      }

      observer.next({ allowed: true });
      observer.complete();
    });
  }

  /**
   * Perform basic security checks
   */
  private performBasicSecurityChecks(): { passed: boolean; reason?: string } {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return { passed: false, reason: 'User not authenticated' };
    }

    // Check for suspicious activity
    const threats = this.securityService.getThreats();
    const recentSuspiciousActivity = threats.filter(threat => 
      threat.severity === 'high' || threat.severity === 'critical' &&
      Date.now() - threat.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentSuspiciousActivity.length > 0) {
      return { passed: false, reason: 'Recent suspicious activity detected' };
    }

    // Check session validity
    const sessionValid = this.checkSessionValidity();
    if (!sessionValid) {
      return { passed: false, reason: 'Invalid or expired session' };
    }

    // Check for security headers
    if (!this.checkSecurityHeaders()) {
      return { passed: false, reason: 'Missing required security headers' };
    }

    return { passed: true };
  }

  /**
   * Perform enhanced security checks
   */
  private performEnhancedSecurityChecks(): { passed: boolean; reason?: string } {
    // Check for secure connection
    if (location.protocol !== 'https:' && !this.isLocalhost()) {
      return { passed: false, reason: 'Insecure connection detected' };
    }

    // Check for tampered client
    if (!this.checkClientIntegrity()) {
      return { passed: false, reason: 'Client integrity check failed' };
    }

    // Check for development tools
    if (this.isDevToolsOpen()) {
      this.securityService.logSecurityThreat({
        type: 'suspicious-activity',
        severity: 'medium',
        description: 'Developer tools detected while accessing sensitive area',
        timestamp: new Date(),
        blocked: false
      });
    }

    // Rate limiting check
    if (!this.checkRateLimit()) {
      return { passed: false, reason: 'Rate limit exceeded' };
    }

    return { passed: true };
  }

  /**
   * Perform admin-level security checks
   */
  private async performAdminSecurityChecks(): Promise<{ passed: boolean; reason?: string }> {
    // Check admin role
    if (!this.authService.hasRole('admin') && !this.authService.hasRole('super-admin')) {
      return { passed: false, reason: 'Insufficient privileges' };
    }

    // Check for two-factor authentication
    const user = await this.authService.currentUser$.pipe().toPromise();
    if (user && !user.two_factor_enabled) {
      return { passed: false, reason: 'Two-factor authentication required for admin access' };
    }

    // Check admin session freshness
    const sessionAge = this.getSessionAge();
    if (sessionAge > 15 * 60 * 1000) { // 15 minutes
      return { passed: false, reason: 'Admin session expired, re-authentication required' };
    }

    // Check for admin IP whitelist (if configured)
    const ipAllowed = await this.checkAdminIPWhitelist();
    if (!ipAllowed) {
      return { passed: false, reason: 'Access from unauthorized IP address' };
    }

    return { passed: true };
  }

  /**
   * Check session validity
   */
  private checkSessionValidity(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      // Basic JWT validation (in production, this should be done server-side)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  /**
   * Check security headers
   */
  private checkSecurityHeaders(): boolean {
    // Check if CSP header is present
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return !!cspMeta;
  }

  /**
   * Check if running on localhost
   */
  private isLocalhost(): boolean {
    return location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1' || 
           location.hostname === '::1';
  }

  /**
   * Check client integrity
   */
  private checkClientIntegrity(): boolean {
    // Simple check for common tampering indicators
    if ((window as any).__tampered) return false;
    
    // Check for suspicious global variables
    const suspiciousGlobals = ['webpackJsonp', 'webdriver', 'callPhantom'];
    for (const global of suspiciousGlobals) {
      if ((window as any)[global]) {
        this.securityService.logSecurityThreat({
          type: 'suspicious-activity',
          severity: 'medium',
          description: `Suspicious global variable detected: ${global}`,
          timestamp: new Date(),
          blocked: false
        });
      }
    }

    return true;
  }

  /**
   * Check if developer tools are open
   */
  private isDevToolsOpen(): boolean {
    let devtools = false;
    
    // Detect via console
    const threshold = 160;
    const devtools_console = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        devtools = true;
      }
    };

    devtools_console();
    return devtools;
  }

  /**
   * Check rate limit
   */
  private checkRateLimit(): boolean {
    const key = 'security_check_rate';
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const data = JSON.parse(stored);
      if (now - data.timestamp < 60000) { // 1 minute window
        if (data.count >= 10) { // Max 10 checks per minute
          return false;
        }
        data.count++;
      } else {
        data.count = 1;
        data.timestamp = now;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
    }

    return true;
  }

  /**
   * Get session age in milliseconds
   */
  private getSessionAge(): number {
    const sessionStart = localStorage.getItem('session_start');
    if (!sessionStart) return Infinity;
    
    return Date.now() - parseInt(sessionStart);
  }

  /**
   * Check admin IP whitelist
   */
  private async checkAdminIPWhitelist(): Promise<boolean> {
    // In a real application, this would check against a server-side IP whitelist
    // For now, we'll assume all IPs are allowed
    return true;
  }

  /**
   * Handle security violation
   */
  private handleSecurityViolation(reason: string, attemptedUrl: string): void {
    this.securityService.logSecurityThreat({
      type: 'unauthorized-access',
      severity: 'high',
      description: `Security guard blocked access: ${reason} (URL: ${attemptedUrl})`,
      timestamp: new Date(),
      blocked: true
    });

    // Redirect based on reason
    if (reason.includes('not authenticated')) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: attemptedUrl } 
      });
    } else if (reason.includes('privileges') || reason.includes('two-factor')) {
      this.router.navigate(['/error/unauthorized']);
    } else {
      this.router.navigate(['/error/security']);
    }
  }
}
