import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoroscopeService, Horoscope } from '../core/services/horoscope.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-horoscope',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-lavender-600 mb-2">Your Horoscope ✨</h1>
    <p class="text-gray-600 mb-4">Complete your astrological profile to improve match suggestions.</p>
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
    <form *ngIf="!loading" (ngSubmit)="onSave()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Sun Sign</label>
        <select [(ngModel)]="model.sun_sign" name="sun_sign" class="border rounded px-3 py-2 w-full">
          <option *ngFor="let sign of signs" [value]="sign">{{sign}}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Moon Sign</label>
        <input [(ngModel)]="model.moon_sign" name="moon_sign" class="border rounded px-3 py-2 w-full" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Birth Time (HH:MM)</label>
          <input [(ngModel)]="model.birth_time" name="birth_time" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Birth Place</label>
          <input [(ngModel)]="model.birth_place" name="birth_place" class="border rounded px-3 py-2 w-full" />
        </div>
      </div>
      <div class="pt-2">
        <button class="px-4 py-2 rounded bg-rose-500 text-white">Save Horoscope</button>
      </div>
    </form>
  </div>
  `
})
export class HoroscopeComponent implements OnInit {
  loading = true;
  model: Horoscope = { sun_sign: '' };
  signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

  constructor(private service: HoroscopeService) {}

  ngOnInit(): void {
    this.service.getHoroscope().subscribe({
      next: (h) => { this.model = h || this.model; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSave(): void {
    this.loading = true;
    const req = this.model?.sun_sign ? this.service.updateHoroscope(this.model) : this.service.createHoroscope(this.model);
    req.subscribe({ next: (h) => { this.model = h; this.loading = false; }, error: () => { this.loading = false; } });
  }
}


