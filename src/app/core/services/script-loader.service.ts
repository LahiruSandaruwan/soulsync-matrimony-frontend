import { Injectable } from '@angular/core';

interface LoadedScript {
  src: string;
  loaded: boolean;
  promise: Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private loadedScripts = new Map<string, LoadedScript>();

  load(src: string, attributes: Record<string, string> = {}): Promise<void> {
    const existing = this.loadedScripts.get(src);
    if (existing) {
      return existing.promise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.async = true;
      Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

      document.head.appendChild(script);
    });

    this.loadedScripts.set(src, { src, loaded: true, promise });
    return promise;
  }
}

