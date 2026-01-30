import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getTranslation(lang: string) {
    // During SSR, return empty translations to avoid blocking
    if (!isPlatformBrowser(this.platformId)) {
      return of({} as Translation);
    }

    return this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
      catchError(() => {
        console.warn(`Failed to load translations for ${lang}`);
        return of({} as Translation);
      })
    );
  }
}
