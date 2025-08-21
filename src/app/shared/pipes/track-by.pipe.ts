import { Pipe, PipeTransform } from '@angular/core';

/**
 * Track by pipe for optimized ngFor loops
 * Usage: *ngFor="let item of items; trackBy: trackByFn"
 */
@Pipe({
  name: 'trackBy',
  standalone: true,
  pure: true
})
export class TrackByPipe implements PipeTransform {

  /**
   * Create a trackBy function for a specific property
   * @param property Property name to track by
   * @returns TrackBy function
   */
  transform(property: string): (index: number, item: any) => any {
    return (index: number, item: any) => {
      if (!item) return index;
      return property ? item[property] : item;
    };
  }
}

/**
 * Utility class for common trackBy functions
 */
export class TrackByUtils {
  
  /**
   * Track by ID property (most common case)
   */
  static trackById(index: number, item: { id: any }): any {
    return item ? item.id : index;
  }

  /**
   * Track by index (fallback)
   */
  static trackByIndex(index: number, item: any): number {
    return index;
  }

  /**
   * Track by property
   */
  static trackByProperty<T>(property: keyof T) {
    return (index: number, item: T): any => {
      return item ? item[property] : index;
    };
  }

  /**
   * Track by multiple properties
   */
  static trackByProperties<T>(...properties: (keyof T)[]): (index: number, item: T) => string {
    return (index: number, item: T): string => {
      if (!item) return index.toString();
      return properties.map(prop => item[prop]).join('|');
    };
  }

  /**
   * Track by value (for primitive arrays)
   */
  static trackByValue(index: number, item: any): any {
    return item !== null && item !== undefined ? item : index;
  }
}
