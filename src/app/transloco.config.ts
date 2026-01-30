import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export const translocoProviders = [
  provideTransloco({
    config: {
      availableLangs: ['en', 'si', 'ta'],
      defaultLang: 'en',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
      missingHandler: {
        useFallbackTranslation: true,
        logMissingKey: true
      }
    },
    loader: TranslocoHttpLoader
  })
];
