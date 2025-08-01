import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface SearchFilters {
  age_min?: number;
  age_max?: number;
  location?: string;
  religion?: string;
  education_level?: string;
  occupation?: string;
  marital_status?: string;
  has_children?: boolean;
  willing_to_relocate?: boolean;
  diet?: string;
  smoking?: string;
  drinking?: string;
  family_type?: string;
  family_status?: string;
  annual_income_min?: number;
  annual_income_max?: number;
  height_min?: number;
  height_max?: number;
  mother_tongue?: string;
  languages_known?: string[];
  horoscope?: string;
  online_status?: 'online' | 'offline' | 'all';
  profile_completion_min?: number;
  verified_only?: boolean;
  photo_required?: boolean;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  @Input() filters: SearchFilters = {};
  @Input() showAdvanced: boolean = false;
  
  @Output() filtersChanged = new EventEmitter<SearchFilters>();
  @Output() searchApplied = new EventEmitter<SearchFilters>();
  @Output() filtersReset = new EventEmitter<void>();

  filterForm: FormGroup;

  // Filter options
  religions = [
    'Buddhism', 'Christianity', 'Hinduism', 'Islam', 'Judaism', 'Sikhism', 'Other'
  ];

  educationLevels = [
    'High School', 'Diploma', 'Bachelors', 'Masters', 'PhD', 'Other'
  ];

  maritalStatuses = [
    'Never Married', 'Divorced', 'Widowed', 'Separated'
  ];

  diets = [
    'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Other'
  ];

  smokingHabits = [
    'Never', 'Occasionally', 'Regularly', 'Quit'
  ];

  drinkingHabits = [
    'Never', 'Socially', 'Regularly', 'Quit'
  ];

  familyTypes = [
    'Nuclear', 'Joint', 'Extended'
  ];

  familyStatuses = [
    'Upper Class', 'Upper Middle Class', 'Middle Class', 'Lower Middle Class'
  ];

  languages = [
    'English', 'Sinhala', 'Tamil', 'Hindi', 'Arabic', 'Chinese', 'Other'
  ];

  horoscopes = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      age_min: [null],
      age_max: [null],
      location: [''],
      religion: [''],
      education_level: [''],
      occupation: [''],
      marital_status: [''],
      has_children: [null],
      willing_to_relocate: [null],
      diet: [''],
      smoking: [''],
      drinking: [''],
      family_type: [''],
      family_status: [''],
      annual_income_min: [null],
      annual_income_max: [null],
      height_min: [null],
      height_max: [null],
      mother_tongue: [''],
      languages_known: [[]],
      horoscope: [''],
      online_status: ['all'],
      profile_completion_min: [null],
      verified_only: [false],
      photo_required: [false]
    });
  }

  ngOnInit(): void {
    this.filterForm.patchValue(this.filters);
    
    this.filterForm.valueChanges.subscribe(values => {
      this.filtersChanged.emit(values);
    });
  }

  onApplyFilters(): void {
    const filters = this.filterForm.value;
    this.searchApplied.emit(filters);
  }

  onResetFilters(): void {
    this.filterForm.reset({
      online_status: 'all',
      verified_only: false,
      photo_required: false,
      languages_known: []
    });
    this.filtersReset.emit();
  }

  onClearField(fieldName: string): void {
    this.filterForm.get(fieldName)?.setValue(null);
  }

  onToggleLanguage(language: string): void {
    const currentLanguages = this.filterForm.get('languages_known')?.value || [];
    const index = currentLanguages.indexOf(language);
    
    if (index > -1) {
      currentLanguages.splice(index, 1);
    } else {
      currentLanguages.push(language);
    }
    
    this.filterForm.get('languages_known')?.setValue(currentLanguages);
  }

  isLanguageSelected(language: string): boolean {
    const selectedLanguages = this.filterForm.get('languages_known')?.value || [];
    return selectedLanguages.includes(language);
  }

  getActiveFiltersCount(): number {
    const values = this.filterForm.value;
    let count = 0;
    
    Object.keys(values).forEach(key => {
      const value = values[key];
      if (value !== null && value !== '' && value !== false && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        count++;
      }
    });
    
    return count;
  }

  getIncomeRangeText(): string {
    const min = this.filterForm.get('annual_income_min')?.value;
    const max = this.filterForm.get('annual_income_max')?.value;
    
    if (min && max) {
      return `${min}K - ${max}K USD`;
    } else if (min) {
      return `${min}K+ USD`;
    } else if (max) {
      return `Up to ${max}K USD`;
    }
    return 'Any';
  }

  getHeightRangeText(): string {
    const min = this.filterForm.get('height_min')?.value;
    const max = this.filterForm.get('height_max')?.value;
    
    if (min && max) {
      return `${min}cm - ${max}cm`;
    } else if (min) {
      return `${min}cm+`;
    } else if (max) {
      return `Up to ${max}cm`;
    }
    return 'Any';
  }

  getAgeRangeText(): string {
    const min = this.filterForm.get('age_min')?.value;
    const max = this.filterForm.get('age_max')?.value;
    
    if (min && max) {
      return `${min} - ${max} years`;
    } else if (min) {
      return `${min}+ years`;
    } else if (max) {
      return `Up to ${max} years`;
    }
    return 'Any';
  }
} 