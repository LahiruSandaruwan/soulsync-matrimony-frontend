import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeStyle } from '@angular/platform-browser';

export interface SecurityConfig {
  enableCSRF: boolean;
  enableXSSProtection: boolean;
  enableContentSecurityPolicy: boolean;
  enableRateLimiting: boolean;
  maxRequestSize: number;
  allowedFileTypes: string[];
  blockedPatterns: RegExp[];
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private csrfToken: string | null = null;
  private requestCount = new Map<string, number>();
  private lastRequestTime = new Map<string, number>();
  private readonly maxRequestsPerMinute = 60;
  private readonly maxRequestsPerHour = 1000;

  constructor(private sanitizer: DomSanitizer) {
    this.loadCSRFToken();
  }

  // CSRF Protection
  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  private loadCSRFToken(): void {
    const tokenFromMeta = typeof document !== 'undefined'
      ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      : null;
    const tokenFromStorage = typeof localStorage !== 'undefined'
      ? localStorage.getItem('csrf_token')
      : null;
    this.csrfToken = tokenFromStorage || tokenFromMeta || null;
  }

  setCSRFToken(token: string): void {
    this.csrfToken = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('csrf_token', token);
    }
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.sanitizeInput(html));
  }

  sanitizeUrl(url: string): SafeUrl {
    const sanitizedUrl = this.sanitizeInput(url);
    if (this.isValidUrl(sanitizedUrl)) {
      return this.sanitizer.bypassSecurityTrustUrl(sanitizedUrl);
    }
    return this.sanitizer.bypassSecurityTrustUrl('');
  }

  sanitizeStyle(style: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(this.sanitizeInput(style));
  }

  // URL Validation
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // File Upload Security
  validateFile(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): boolean {
    if (!file) return false;
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return false;
    }
    
    // Check file name for suspicious patterns
    const fileName = file.name.toLowerCase();
    const blockedPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|dll|so|dylib)$/i,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    ];
    
    return !blockedPatterns.some(pattern => pattern.test(fileName));
  }

  // Rate Limiting
  isRateLimited(endpoint: string): boolean {
    const now = Date.now();
    const key = endpoint;
    
    // Clean old entries
    if (this.lastRequestTime.has(key)) {
      const timeDiff = now - this.lastRequestTime.get(key)!;
      if (timeDiff > 60000) { // 1 minute
        this.requestCount.delete(key);
        this.lastRequestTime.delete(key);
      }
    }
    
    // Check rate limits
    const currentCount = this.requestCount.get(key) || 0;
    if (currentCount >= this.maxRequestsPerMinute) {
      return true;
    }
    
    // Update counters
    this.requestCount.set(key, currentCount + 1);
    this.lastRequestTime.set(key, now);
    
    return false;
  }

  // Content Security Policy
  generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' http://localhost:8000 https://api.stripe.com https://api.paypal.com",
      "frame-src 'self' https://js.stripe.com https://www.paypal.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  // Password Strength Validation
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }
    
    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }
    
    const isValid = score >= 4;
    
    return {
      isValid,
      score,
      feedback
    };
  }

  // Email Validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone Number Validation
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // SQL Injection Prevention
  containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast|convert|truncate)\b)/i,
      /(--|\/\*|\*\/|xp_|sp_)/i,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/i,
      /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS Prevention
  containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Input Validation
  validateInput(input: string, type: 'text' | 'email' | 'phone' | 'url' | 'number'): boolean {
    if (!input) return false;
    
    // Check for malicious patterns
    if (this.containsSQLInjection(input) || this.containsXSS(input)) {
      return false;
    }
    
    switch (type) {
      case 'email':
        return this.validateEmail(input);
      case 'phone':
        return this.validatePhoneNumber(input);
      case 'url':
        return this.isValidUrl(input);
      case 'number':
        return !isNaN(Number(input)) && isFinite(Number(input));
      default:
        return input.length <= 1000; // Max text length
    }
  }

  // Clear rate limiting data
  clearRateLimitData(): void {
    this.requestCount.clear();
    this.lastRequestTime.clear();
  }

  // Get security headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.generateCSP()
    };
  }
} 