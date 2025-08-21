import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { HoroscopeComponent } from './horoscope.component';
import { HoroscopeService, Horoscope } from '../core/services/horoscope.service';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';

describe('HoroscopeComponent', () => {
  let component: HoroscopeComponent;
  let fixture: ComponentFixture<HoroscopeComponent>;
  let horoscopeService: jasmine.SpyObj<HoroscopeService>;

  const mockHoroscope: Horoscope = {
    sun_sign: 'aries',
    moon_sign: 'taurus',
    birth_time: '10:30',
    birth_place: 'Colombo, Sri Lanka'
  };

  beforeEach(async () => {
    const horoscopeServiceSpy = jasmine.createSpyObj('HoroscopeService', [
      'getHoroscope',
      'createHoroscope',
      'updateHoroscope'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HoroscopeComponent,
        LoadingSpinnerComponent
      ],
      providers: [
        { provide: HoroscopeService, useValue: horoscopeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HoroscopeComponent);
    component = fixture.componentInstance;
    horoscopeService = TestBed.inject(HoroscopeService) as jasmine.SpyObj<HoroscopeService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.model.sun_sign).toBe('');
    expect(component.signs).toEqual(['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']);
  });

  describe('ngOnInit', () => {
    it('should load existing horoscope data successfully', () => {
      horoscopeService.getHoroscope.and.returnValue(of(mockHoroscope));

      component.ngOnInit();

      expect(horoscopeService.getHoroscope).toHaveBeenCalled();
      expect(component.model).toEqual(mockHoroscope);
      expect(component.loading).toBe(false);
    });

    it('should handle empty horoscope data', () => {
      horoscopeService.getHoroscope.and.returnValue(of(null));

      component.ngOnInit();

      expect(component.model.sun_sign).toBe('');
      expect(component.loading).toBe(false);
    });

    it('should handle service error', () => {
      horoscopeService.getHoroscope.and.returnValue(throwError('Service error'));

      component.ngOnInit();

      expect(component.loading).toBe(false);
    });
  });

  describe('onSave', () => {
    beforeEach(() => {
      component.loading = false;
    });

    it('should create new horoscope when sun_sign is empty', () => {
      component.model = { sun_sign: '' };
      horoscopeService.createHoroscope.and.returnValue(of(mockHoroscope));

      component.onSave();

      expect(component.loading).toBe(true);
      expect(horoscopeService.createHoroscope).toHaveBeenCalledWith(component.model);
    });

    it('should update existing horoscope when sun_sign exists', () => {
      component.model = mockHoroscope;
      horoscopeService.updateHoroscope.and.returnValue(of(mockHoroscope));

      component.onSave();

      expect(component.loading).toBe(true);
      expect(horoscopeService.updateHoroscope).toHaveBeenCalledWith(component.model);
    });

    it('should handle successful save', () => {
      component.model = mockHoroscope;
      horoscopeService.updateHoroscope.and.returnValue(of(mockHoroscope));

      component.onSave();

      expect(component.model).toEqual(mockHoroscope);
      expect(component.loading).toBe(false);
    });

    it('should handle save error', () => {
      component.model = mockHoroscope;
      horoscopeService.updateHoroscope.and.returnValue(throwError('Save error'));

      component.onSave();

      expect(component.loading).toBe(false);
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      horoscopeService.getHoroscope.and.returnValue(of(mockHoroscope));
      fixture.detectChanges();
    });

    it('should display loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.nativeElement.querySelector('app-loading-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display form when not loading', () => {
      component.loading = false;
      fixture.detectChanges();

      const form = fixture.debugElement.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should populate form with horoscope data', () => {
      component.loading = false;
      component.model = mockHoroscope;
      fixture.detectChanges();

      const sunSignSelect = fixture.debugElement.nativeElement.querySelector('#sun-sign');
      expect(sunSignSelect.value).toBe('aries');
    });

    it('should call onSave when form is submitted', () => {
      spyOn(component, 'onSave');
      component.loading = false;
      fixture.detectChanges();

      const form = fixture.debugElement.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));

      expect(component.onSave).toHaveBeenCalled();
    });

    it('should disable submit button when no sun sign selected', () => {
      component.loading = false;
      component.model.sun_sign = '';
      fixture.detectChanges();

      const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(true);
    });

    it('should enable submit button when sun sign is selected', () => {
      component.loading = false;
      component.model.sun_sign = 'aries';
      fixture.detectChanges();

      const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      horoscopeService.getHoroscope.and.returnValue(of(mockHoroscope));
      component.loading = false;
      fixture.detectChanges();
    });

    it('should have proper labels for form fields', () => {
      const sunSignLabel = fixture.debugElement.nativeElement.querySelector('label[for="sun-sign"]');
      const moonSignLabel = fixture.debugElement.nativeElement.querySelector('label[for="moon-sign"]');
      
      expect(sunSignLabel).toBeTruthy();
      expect(moonSignLabel).toBeTruthy();
    });

    it('should have aria-describedby attributes for help text', () => {
      const sunSignInput = fixture.debugElement.nativeElement.querySelector('#sun-sign');
      expect(sunSignInput.getAttribute('aria-describedby')).toBe('sun-sign-help');
    });

    it('should have proper aria-label for submit button', () => {
      const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.getAttribute('aria-label')).toBe('Save horoscope information');
    });
  });
});
