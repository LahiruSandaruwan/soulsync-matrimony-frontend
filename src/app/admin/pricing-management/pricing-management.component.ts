import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

interface CountryPricingConfig {
  id: number;
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  basic_monthly: number;
  basic_quarterly: number;
  basic_yearly: number;
  premium_monthly: number;
  premium_quarterly: number;
  premium_yearly: number;
  platinum_monthly: number;
  platinum_quarterly: number;
  platinum_yearly: number;
  quarterly_discount: number;
  yearly_discount: number;
  payment_methods: string[];
  tax_rate: number;
  tax_name: string | null;
  tax_inclusive: boolean;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PriceAdjustment {
  percentage: number;
  countries: string[];
  plans: string[];
}

@Component({
  selector: 'app-pricing-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './pricing-management.component.html',
  styleUrls: ['./pricing-management.component.scss']
})
export class PricingManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  saving = false;
  error = '';
  success = '';

  countries: CountryPricingConfig[] = [];
  selectedCountry: CountryPricingConfig | null = null;
  editMode = false;
  showAddModal = false;
  showAdjustModal = false;

  // Filter and sort
  searchTerm = '';
  filterActive: 'all' | 'active' | 'inactive' = 'all';
  sortBy = 'display_order';
  sortDir: 'asc' | 'desc' = 'asc';

  // New country form
  newCountry: Partial<CountryPricingConfig> = this.getEmptyCountry();

  // Bulk price adjustment
  priceAdjustment: PriceAdjustment = {
    percentage: 0,
    countries: [],
    plans: ['basic', 'premium', 'platinum']
  };

  availablePaymentMethods = ['stripe', 'paypal', 'payhere', 'webxpay'];
  availablePlans = ['basic', 'premium', 'platinum'];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCountries(): void {
    this.loading = true;
    this.error = '';

    let endpoint = `/admin/pricing/countries?sort_by=${this.sortBy}&sort_dir=${this.sortDir}`;
    if (this.filterActive !== 'all') {
      endpoint += `&active=${this.filterActive === 'active'}`;
    }
    if (this.searchTerm) {
      endpoint += `&search=${encodeURIComponent(this.searchTerm)}`;
    }

    this.apiService.get<{ data: CountryPricingConfig[] }>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.countries = response.data?.data || response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.handleError('Failed to load country pricing', error);
          this.loading = false;
        }
      });
  }

  onSelectCountry(country: CountryPricingConfig): void {
    this.selectedCountry = { ...country };
    this.editMode = true;
  }

  onSaveCountry(): void {
    if (!this.selectedCountry) return;

    this.saving = true;
    this.error = '';

    const endpoint = `/admin/pricing/countries/${this.selectedCountry.country_code}`;
    const data = this.prepareCountryData(this.selectedCountry);

    this.apiService.put<CountryPricingConfig>(endpoint, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Country pricing updated successfully');
          this.editMode = false;
          this.selectedCountry = null;
          this.loadCountries();
          this.saving = false;
        },
        error: (error) => {
          this.handleError('Failed to update country pricing', error);
          this.saving = false;
        }
      });
  }

  onAddCountry(): void {
    this.newCountry = this.getEmptyCountry();
    this.showAddModal = true;
  }

  onSaveNewCountry(): void {
    this.saving = true;
    this.error = '';

    this.apiService.post<CountryPricingConfig>('/admin/pricing/countries', this.newCountry)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Country pricing created successfully');
          this.showAddModal = false;
          this.newCountry = this.getEmptyCountry();
          this.loadCountries();
          this.saving = false;
        },
        error: (error) => {
          this.handleError('Failed to create country pricing', error);
          this.saving = false;
        }
      });
  }

  onDeleteCountry(country: CountryPricingConfig): void {
    if (country.is_default) {
      this.toastService.error('Cannot delete the default country pricing');
      return;
    }

    if (!confirm(`Are you sure you want to deactivate pricing for ${country.country_name}?`)) {
      return;
    }

    this.apiService.delete<void>(`/admin/pricing/countries/${country.country_code}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Country pricing deactivated');
          this.loadCountries();
        },
        error: (error) => {
          this.handleError('Failed to deactivate country pricing', error);
        }
      });
  }

  onToggleActive(country: CountryPricingConfig): void {
    const endpoint = `/admin/pricing/countries/${country.country_code}`;
    const data = { is_active: !country.is_active };

    this.apiService.put<CountryPricingConfig>(endpoint, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(`Country pricing ${data.is_active ? 'activated' : 'deactivated'}`);
          this.loadCountries();
        },
        error: (error) => {
          this.handleError('Failed to update status', error);
        }
      });
  }

  onOpenAdjustModal(): void {
    this.priceAdjustment = {
      percentage: 0,
      countries: [],
      plans: ['basic', 'premium', 'platinum']
    };
    this.showAdjustModal = true;
  }

  onApplyPriceAdjustment(): void {
    if (this.priceAdjustment.percentage === 0) {
      this.toastService.error('Please enter a percentage');
      return;
    }

    this.saving = true;

    const payload: any = {
      percentage: this.priceAdjustment.percentage,
      plans: this.priceAdjustment.plans
    };

    if (this.priceAdjustment.countries.length > 0) {
      payload.countries = this.priceAdjustment.countries;
    }

    this.apiService.post<any>('/admin/pricing/adjust-prices', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastService.success(response.message || 'Prices adjusted successfully');
          this.showAdjustModal = false;
          this.loadCountries();
          this.saving = false;
        },
        error: (error) => {
          this.handleError('Failed to adjust prices', error);
          this.saving = false;
        }
      });
  }

  onSearch(): void {
    this.loadCountries();
  }

  onFilterChange(): void {
    this.loadCountries();
  }

  onSortChange(field: string): void {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.loadCountries();
  }

  onCancelEdit(): void {
    this.editMode = false;
    this.selectedCountry = null;
  }

  onCloseAddModal(): void {
    this.showAddModal = false;
    this.newCountry = this.getEmptyCountry();
  }

  onCloseAdjustModal(): void {
    this.showAdjustModal = false;
  }

  togglePaymentMethod(methods: string[], method: string): void {
    const index = methods.indexOf(method);
    if (index === -1) {
      methods.push(method);
    } else {
      methods.splice(index, 1);
    }
  }

  togglePlan(plan: string): void {
    const index = this.priceAdjustment.plans.indexOf(plan);
    if (index === -1) {
      this.priceAdjustment.plans.push(plan);
    } else {
      this.priceAdjustment.plans.splice(index, 1);
    }
  }

  toggleCountryForAdjustment(countryCode: string): void {
    const index = this.priceAdjustment.countries.indexOf(countryCode);
    if (index === -1) {
      this.priceAdjustment.countries.push(countryCode);
    } else {
      this.priceAdjustment.countries.splice(index, 1);
    }
  }

  isPaymentMethodSelected(methods: string[], method: string): boolean {
    return methods.includes(method);
  }

  formatPrice(amount: number, symbol: string): string {
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private getEmptyCountry(): Partial<CountryPricingConfig> {
    return {
      country_code: '',
      country_name: '',
      currency_code: '',
      currency_symbol: '',
      basic_monthly: 0,
      basic_quarterly: 0,
      basic_yearly: 0,
      premium_monthly: 0,
      premium_quarterly: 0,
      premium_yearly: 0,
      platinum_monthly: 0,
      platinum_quarterly: 0,
      platinum_yearly: 0,
      quarterly_discount: 10,
      yearly_discount: 20,
      payment_methods: ['stripe', 'paypal'],
      tax_rate: 0,
      tax_name: null,
      tax_inclusive: false,
      display_order: 100,
      is_active: true,
      is_default: false,
      notes: null
    };
  }

  private prepareCountryData(country: CountryPricingConfig): Partial<CountryPricingConfig> {
    const { id, country_code, created_at, updated_at, ...data } = country;
    return data;
  }

  private handleError(message: string, error: any): void {
    this.error = error?.error?.message || message;
    this.toastService.error(this.error);
    if (!environment.production) {
      console.error(`Pricing Management Error: ${message}`, error);
    }
  }
}
