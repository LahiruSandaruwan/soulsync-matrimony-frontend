import { Injectable, inject, signal, computed } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  Language,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY
} from '../models/language.model';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private transloco = inject(TranslocoService);

  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  private currentLanguageSignal = signal<string>(this.getInitialLanguage());

  readonly currentLanguage = computed(() => this.currentLanguageSignal());
  readonly currentLanguageDetails = computed(() =>
    this.supportedLanguages.find(l => l.code === this.currentLanguageSignal()) || this.supportedLanguages[0]
  );

  constructor() {
    this.initializeLanguage();
  }

  private getInitialLanguage(): string {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && this.isSupported(stored)) {
        return stored;
      }
    }

    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && this.isSupported(browserLang)) {
        return browserLang;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  private initializeLanguage(): void {
    const lang = this.getInitialLanguage();
    this.transloco.setActiveLang(lang);
    this.updateDocumentAttributes(lang);
  }

  setLanguage(langCode: string): void {
    if (!this.isSupported(langCode)) {
      console.warn(`Language ${langCode} is not supported`);
      return;
    }

    this.transloco.setActiveLang(langCode);
    this.currentLanguageSignal.set(langCode);
    this.persistLanguage(langCode);
    this.updateDocumentAttributes(langCode);
  }

  private isSupported(langCode: string): boolean {
    return this.supportedLanguages.some(l => l.code === langCode);
  }

  private persistLanguage(langCode: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
    }
  }

  private updateDocumentAttributes(langCode: string): void {
    if (typeof document !== 'undefined') {
      const lang = this.supportedLanguages.find(l => l.code === langCode);
      document.documentElement.lang = langCode;
      document.documentElement.dir = lang?.direction || 'ltr';
    }
  }

  getLanguage(code: string): Language | undefined {
    return this.supportedLanguages.find(l => l.code === code);
  }
}
