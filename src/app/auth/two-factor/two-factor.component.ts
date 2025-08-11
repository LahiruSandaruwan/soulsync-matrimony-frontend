import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-rose-600 mb-2">Two-Factor Authentication 🔐</h1>
    <p class="text-gray-600 mb-4">Add an extra layer of security to your SoulSync account.</p>
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>

    <div *ngIf="!enabled">
      <button class="px-4 py-2 bg-rose-500 text-white rounded-lg" (click)="onSetup()">Enable 2FA</button>
    </div>

    <div *ngIf="enabled" class="space-y-4">
      <div class="p-4 bg-rose-50 rounded-lg">
        <h2 class="font-semibold mb-2">Verify Setup</h2>
        <input [(ngModel)]="code" placeholder="Enter code" class="border rounded px-3 py-2 w-full" />
        <button class="mt-2 px-4 py-2 bg-rose-500 text-white rounded" (click)="onVerify()">Verify</button>
      </div>
      <div class="p-4 bg-pink-50 rounded-lg">
        <h2 class="font-semibold mb-2">Recovery Codes</h2>
        <button class="px-3 py-2 bg-pink-500 text-white rounded" (click)="onRecoveryCodes()">Generate</button>
      </div>
      <div class="p-4 bg-beige-50 rounded-lg">
        <h2 class="font-semibold mb-2">Disable</h2>
        <input [(ngModel)]="password" type="password" placeholder="Current password" class="border rounded px-3 py-2 w-full" />
        <button class="mt-2 px-3 py-2 bg-gray-600 text-white rounded" (click)="onDisable()">Disable 2FA</button>
      </div>
    </div>
  </div>
  `
})
export class TwoFactorComponent {
  loading = false;
  enabled = false;
  code = '';
  password = '';

  constructor(private auth: AuthService) {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.auth.getTwoFactorStatus().subscribe({ next: (res) => { this.enabled = !!res?.enabled; this.loading = false; }, error: () => this.loading = false });
  }
  onSetup(): void {
    this.loading = true;
    this.auth.setupTwoFactor().subscribe({ next: () => { this.enabled = true; this.loading = false; }, error: () => this.loading = false });
  }
  onVerify(): void {
    if (!this.code) return;
    this.loading = true;
    this.auth.verifyTwoFactorSetup(this.code).subscribe({ next: () => { this.loading = false; }, error: () => this.loading = false });
  }
  onRecoveryCodes(): void {
    this.auth.generateRecoveryCodes().subscribe();
  }
  onDisable(): void {
    this.loading = true;
    this.auth.disableTwoFactor(this.password).subscribe({ next: () => { this.enabled = false; this.loading = false; }, error: () => this.loading = false });
  }
}


