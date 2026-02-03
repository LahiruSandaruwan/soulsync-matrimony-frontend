import { ApplicationConfig, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ServiceWorkerService } from './core/services/service-worker.service';
import { SecurityService } from './core/services/security.service';
import { NotificationService } from './core/services/notification.service';
import { RuntimeConfigService } from './core/services/runtime-config.service';
import { environment } from '../environments/environment';
import { translocoProviders } from './transloco.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    ...translocoProviders,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const sw = inject(ServiceWorkerService);
        const notifications = inject(NotificationService);
        const runtime = inject(RuntimeConfigService);
        return async () => {
          try {
            await runtime.load();
            if (environment.performance.enablePWA) {
              await sw.registerServiceWorker();
              if (environment.notifications.enablePush && environment.notifications.vapidPublicKey) {
                await notifications.ensurePushSubscription(environment.notifications.vapidPublicKey);
              }
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
          if (typeof document !== 'undefined' && typeof window !== 'undefined' && 
              environment.analytics.enableGoogleAnalytics && environment.analytics.googleAnalyticsId) {
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
          if (typeof document !== 'undefined' && environment.security.enableContentSecurityPolicy) {
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
