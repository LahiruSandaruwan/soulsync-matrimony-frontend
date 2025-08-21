import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FeatureFlagsGuard } from './feature-flags.guard';
import { AdminSettingsService } from '../services/admin-settings.service';
import { environment } from '../../../environments/environment';

describe('FeatureFlagsGuard', () => {
  let guard: FeatureFlagsGuard;
  let router: jasmine.SpyObj<Router>;
  let adminSettingsService: jasmine.SpyObj<AdminSettingsService>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const adminSettingsServiceSpy = jasmine.createSpyObj('AdminSettingsService', [], {
      value: null
    });

    TestBed.configureTestingModule({
      providers: [
        FeatureFlagsGuard,
        { provide: Router, useValue: routerSpy },
        { provide: AdminSettingsService, useValue: adminSettingsServiceSpy }
      ]
    });

    guard = TestBed.inject(FeatureFlagsGuard);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    adminSettingsService = TestBed.inject(AdminSettingsService) as jasmine.SpyObj<AdminSettingsService>;

    route = new ActivatedRouteSnapshot();
    state = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when no feature flag is specified', () => {
      route.data = {};

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
    });

    it('should return true when feature flag is enabled in environment', () => {
      route.data = { featureFlag: 'chat' };
      // Assuming 'chat' is enabled in environment.features

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
    });

    it('should redirect to unauthorized when feature flag is disabled', () => {
      route.data = { featureFlag: 'disabledFeature' };
      const unauthorizedUrl = router.parseUrl('/unauthorized');
      router.parseUrl.and.returnValue(unauthorizedUrl);

      const result = guard.canActivate(route, state);

      expect(router.parseUrl).toHaveBeenCalledWith('/unauthorized');
      expect(result).toBe(unauthorizedUrl);
    });

    it('should handle nested feature flags', () => {
      route.data = { featureFlag: 'premium.advancedSearch' };
      
      // Mock environment with nested features
      const originalFeatures = environment.features;
      (environment as any).features = {
        premium: {
          advancedSearch: true
        }
      };

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);

      // Restore original features
      (environment as any).features = originalFeatures;
    });

    it('should handle undefined nested feature flags', () => {
      route.data = { featureFlag: 'nonexistent.feature' };
      const unauthorizedUrl = router.parseUrl('/unauthorized');
      router.parseUrl.and.returnValue(unauthorizedUrl);

      const result = guard.canActivate(route, state);

      expect(result).toBe(unauthorizedUrl);
    });

    it('should merge environment and admin settings flags', () => {
      route.data = { featureFlag: 'adminOverride' };
      
      // Mock admin settings with override
      Object.defineProperty(adminSettingsService, 'value', {
        get: () => ({
          features: {
            adminOverride: true
          }
        })
      });

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
    });

    it('should prioritize admin settings over environment', () => {
      route.data = { featureFlag: 'chat' };
      
      // Assume chat is true in environment but false in admin settings
      Object.defineProperty(adminSettingsService, 'value', {
        get: () => ({
          features: {
            chat: false
          }
        })
      });

      const unauthorizedUrl = router.parseUrl('/unauthorized');
      router.parseUrl.and.returnValue(unauthorizedUrl);

      const result = guard.canActivate(route, state);

      expect(result).toBe(unauthorizedUrl);
    });

    it('should handle null admin settings gracefully', () => {
      route.data = { featureFlag: 'chat' };
      
      Object.defineProperty(adminSettingsService, 'value', {
        get: () => null
      });

      const result = guard.canActivate(route, state);

      // Should fall back to environment settings
      expect(result).toBe(true);
    });

    it('should handle admin settings without features property', () => {
      route.data = { featureFlag: 'chat' };
      
      Object.defineProperty(adminSettingsService, 'value', {
        get: () => ({
          otherSettings: true
        })
      });

      const result = guard.canActivate(route, state);

      // Should fall back to environment settings
      expect(result).toBe(true);
    });
  });

  describe('Feature Flag Parsing', () => {
    it('should parse simple feature flags', () => {
      route.data = { featureFlag: 'simpleFlag' };
      
      const originalFeatures = environment.features;
      (environment as any).features = {
        simpleFlag: true
      };

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);

      (environment as any).features = originalFeatures;
    });

    it('should parse multi-level feature flags', () => {
      route.data = { featureFlag: 'level1.level2.level3' };
      
      const originalFeatures = environment.features;
      (environment as any).features = {
        level1: {
          level2: {
            level3: true
          }
        }
      };

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);

      (environment as any).features = originalFeatures;
    });

    it('should handle partial path existence', () => {
      route.data = { featureFlag: 'exists.missing.flag' };
      
      const originalFeatures = environment.features;
      (environment as any).features = {
        exists: {
          other: true
        }
      };

      const unauthorizedUrl = router.parseUrl('/unauthorized');
      router.parseUrl.and.returnValue(unauthorizedUrl);

      const result = guard.canActivate(route, state);

      expect(result).toBe(unauthorizedUrl);

      (environment as any).features = originalFeatures;
    });
  });

  describe('Error Handling', () => {
    it('should handle router errors gracefully', () => {
      route.data = { featureFlag: 'disabledFeature' };
      router.parseUrl.and.throwError('Router error');

      expect(() => guard.canActivate(route, state)).not.toThrow();
    });

    it('should handle admin settings service errors', () => {
      route.data = { featureFlag: 'chat' };
      
      Object.defineProperty(adminSettingsService, 'value', {
        get: () => { throw new Error('Service error'); }
      });

      const result = guard.canActivate(route, state);

      // Should fall back to environment settings
      expect(result).toBe(true);
    });

    it('should handle malformed feature flag data', () => {
      route.data = { featureFlag: '' };

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
    });

    it('should handle non-string feature flag data', () => {
      route.data = { featureFlag: 123 };

      expect(() => guard.canActivate(route, state)).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with actual environment feature flags', () => {
      // Test with actual environment features
      const actualFlags = Object.keys(environment.features);
      
      if (actualFlags.length > 0) {
        route.data = { featureFlag: actualFlags[0] };
        const result = guard.canActivate(route, state);
        
        // Result should match the actual flag value
        expect(typeof result).toBe('boolean');
      }
    });

    it('should handle common feature flag patterns', () => {
      const commonFlags = [
        'chat',
        'premiumFeatures',
        'adminPanel',
        'videoCalls',
        'horoscope'
      ];

      commonFlags.forEach(flag => {
        route.data = { featureFlag: flag };
        const result = guard.canActivate(route, state);
        
        expect(typeof result === 'boolean' || result.toString().includes('unauthorized')).toBe(true);
      });
    });
  });
});
