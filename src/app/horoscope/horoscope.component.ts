import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoroscopeService, Horoscope } from '../core/services/horoscope.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-horoscope',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './horoscope.component.html',
  styleUrls: ['./horoscope.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoroscopeComponent implements OnInit {
  loading = true;
  model: Horoscope = { sun_sign: '' };
  signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

  constructor(private service: HoroscopeService) {}

  /**
   * TrackBy function for signs dropdown to optimize *ngFor performance
   * @param index Array index
   * @param sign Zodiac sign
   * @returns Sign value for tracking
   */
  trackBySign(index: number, sign: string): string {
    return sign;
  }

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


