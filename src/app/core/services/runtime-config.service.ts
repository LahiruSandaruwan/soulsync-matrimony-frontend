import { Injectable } from '@angular/core';

export interface RuntimeConfig {
  payments?: { stripe?: { publishableKey?: string }, paypal?: { clientId?: string } };
  analytics?: { enableGoogleAnalytics?: boolean; googleAnalyticsId?: string };
  features?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private config: RuntimeConfig = {};

  async load(): Promise<void> {
    try {
      const res = await fetch('/assets/runtime-config.json', { cache: 'no-store' });
      if (res.ok) {
        this.config = await res.json();
      }
    } catch (_) {
      this.config = {};
    }
  }

  get<T = any>(path: string, fallback?: T): T | undefined {
    const segments = path.split('.');
    let value: any = this.config as any;
    for (const s of segments) value = value?.[s];
    return (value === undefined ? fallback : value) as T | undefined;
  }
}


