import { ApplicationConfig, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ServiceWorkerService } from './core/services/service-worker.service';
import { SecurityService } from './core/services/security.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const sw = inject(ServiceWorkerService);
        return async () => {
          try {
            if (environment.performance.enablePWA) {
              await sw.registerServiceWorker();
            }
          } catch (e) {
            // noop
          }
        };
      }
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        return () => {
          if (environment.analytics.enableGoogleAnalytics && environment.analytics.googleAnalyticsId) {
            const gtagId = environment.analytics.googleAnalyticsId;
            const script1 = document.createElement('script');
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
            document.head.appendChild(script1);
            const script2 = document.createElement('script');
            script2.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${gtagId}');
            `;
            document.head.appendChild(script2);
          }
        };
      }
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const security = inject(SecurityService);
        return () => {
          if (environment.security.enableContentSecurityPolicy) {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = security.generateCSP();
            document.head.appendChild(meta);
          }
        };
      }
    }
  ]
};
