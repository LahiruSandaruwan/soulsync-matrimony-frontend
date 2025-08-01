import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() color: SpinnerColor = 'primary';
  @Input() text?: string;
  @Input() overlay: boolean = false;
  @Input() fullScreen: boolean = false;

  getSpinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    const colorClasses = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      success: 'text-green-600',
      danger: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-cyan-600',
      light: 'text-gray-300',
      dark: 'text-gray-800'
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  getContainerClasses(): string {
    let classes = 'flex items-center justify-center';
    
    if (this.fullScreen) {
      classes += ' fixed inset-0 z-50 bg-white bg-opacity-75';
    } else if (this.overlay) {
      classes += ' absolute inset-0 bg-white bg-opacity-75';
    }
    
    return classes;
  }

  getTextClasses(): string {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };

    const colorClasses = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      success: 'text-green-600',
      danger: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-cyan-600',
      light: 'text-gray-300',
      dark: 'text-gray-800'
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]} ml-2`;
  }
} 