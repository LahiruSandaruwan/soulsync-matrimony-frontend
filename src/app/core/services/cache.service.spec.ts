import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  const mockData = { id: 1, name: 'Test Data' };
  const testKey = 'test-key';
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('should store data with default TTL', () => {
      service.set(testKey, mockData);
      
      const stored = localStorage.getItem(service['getCacheKey'](testKey));
      expect(stored).toBeTruthy();
      
      const parsedData = JSON.parse(stored!);
      expect(parsedData.data).toEqual(mockData);
      expect(parsedData.ttl).toBeGreaterThan(0);
    });

    it('should store data with custom TTL', () => {
      const customTTL = 60000; // 1 minute
      service.set(testKey, mockData, customTTL);
      
      const stored = localStorage.getItem(service['getCacheKey'](testKey));
      const parsedData = JSON.parse(stored!);
      expect(parsedData.ttl).toBe(customTTL);
    });

    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage full');
      spyOn(service as any, 'handleError');
      
      expect(() => service.set(testKey, mockData)).not.toThrow();
      expect((service as any).handleError).toHaveBeenCalled();
    });

    it('should handle undefined localStorage', () => {
      const originalLocalStorage = localStorage;
      (window as any).localStorage = undefined;
      
      expect(() => service.set(testKey, mockData)).not.toThrow();
      
      (window as any).localStorage = originalLocalStorage;
    });
  });

  describe('get', () => {
    it('should retrieve valid cached data', () => {
      service.set(testKey, mockData);
      
      const result = service.get(testKey);
      expect(result).toEqual(mockData);
    });

    it('should return null for non-existent key', () => {
      const result = service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return null for expired data', () => {
      const shortTTL = 1; // 1ms
      service.set(testKey, mockData, shortTTL);
      
      // Wait for expiration
      setTimeout(() => {
        const result = service.get(testKey);
        expect(result).toBeNull();
      }, 2);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem(service['getCacheKey'](testKey), 'invalid-json');
      spyOn(service as any, 'handleError');
      
      const result = service.get(testKey);
      expect(result).toBeNull();
      expect((service as any).handleError).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'getItem').and.throwError('Storage error');
      spyOn(service as any, 'handleError');
      
      const result = service.get(testKey);
      expect(result).toBeNull();
      expect((service as any).handleError).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should remove cached data', () => {
      service.set(testKey, mockData);
      service.delete(testKey);
      
      const result = service.get(testKey);
      expect(result).toBeNull();
    });

    it('should handle deletion of non-existent key', () => {
      expect(() => service.delete('non-existent-key')).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'removeItem').and.throwError('Storage error');
      spyOn(service as any, 'handleError');
      
      expect(() => service.delete(testKey)).not.toThrow();
      expect((service as any).handleError).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');
      service.set('key3', 'data3');
      
      service.clear();
      
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();
    });

    it('should not affect non-cache localStorage entries', () => {
      localStorage.setItem('other-key', 'other-data');
      service.set(testKey, mockData);
      
      service.clear();
      
      expect(localStorage.getItem('other-key')).toBe('other-data');
      expect(service.get(testKey)).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'key').and.throwError('Storage error');
      spyOn(service as any, 'handleError');
      
      expect(() => service.clear()).not.toThrow();
      expect((service as any).handleError).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('should return true for existing valid data', () => {
      service.set(testKey, mockData);
      expect(service.has(testKey)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('non-existent-key')).toBe(false);
    });

    it('should return false for expired data', () => {
      const shortTTL = 1; // 1ms
      service.set(testKey, mockData, shortTTL);
      
      setTimeout(() => {
        expect(service.has(testKey)).toBe(false);
      }, 2);
    });
  });

  describe('getWithTTL', () => {
    it('should return data with remaining TTL', () => {
      const ttl = 60000; // 1 minute
      service.set(testKey, mockData, ttl);
      
      const result = service.getWithTTL(testKey);
      expect(result).toBeTruthy();
      expect(result!.data).toEqual(mockData);
      expect(result!.ttl).toBeLessThanOrEqual(ttl);
      expect(result!.ttl).toBeGreaterThan(0);
    });

    it('should return null for expired data', () => {
      const shortTTL = 1; // 1ms
      service.set(testKey, mockData, shortTTL);
      
      setTimeout(() => {
        const result = service.getWithTTL(testKey);
        expect(result).toBeNull();
      }, 2);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem(service['getCacheKey'](testKey), 'invalid-json');
      spyOn(service as any, 'handleError');
      
      const result = service.getWithTTL(testKey);
      expect(result).toBeNull();
      expect((service as any).handleError).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');
      service.set('key3', 'data3');
      
      const stats = service.getStats();
      expect(stats.totalEntries).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.expiredEntries).toBe(0);
    });

    it('should count expired entries', () => {
      const shortTTL = 1; // 1ms
      service.set('expired-key', mockData, shortTTL);
      service.set('valid-key', mockData);
      
      setTimeout(() => {
        const stats = service.getStats();
        expect(stats.expiredEntries).toBeGreaterThan(0);
      }, 2);
    });

    it('should handle empty cache', () => {
      const stats = service.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.expiredEntries).toBe(0);
    });
  });

  describe('cleanExpired', () => {
    it('should remove expired entries', () => {
      const shortTTL = 1; // 1ms
      service.set('expired-key', mockData, shortTTL);
      service.set('valid-key', mockData);
      
      setTimeout(() => {
        service.cleanExpired();
        expect(service.get('expired-key')).toBeNull();
        expect(service.get('valid-key')).toEqual(mockData);
      }, 2);
    });

    it('should handle cleanup errors gracefully', () => {
      spyOn(localStorage, 'key').and.throwError('Storage error');
      spyOn(service as any, 'handleError');
      
      expect(() => service.cleanExpired()).not.toThrow();
      expect((service as any).handleError).toHaveBeenCalled();
    });
  });

  describe('cleanOldEntries', () => {
    it('should remove old entries when cache is full', () => {
      // Fill cache with many entries
      for (let i = 0; i < 200; i++) {
        service.set(`key-${i}`, `data-${i}`);
      }
      
      const initialStats = service.getStats();
      service['cleanOldEntries']();
      const finalStats = service.getStats();
      
      expect(finalStats.totalEntries).toBeLessThan(initialStats.totalEntries);
    });
  });

  describe('isExpired', () => {
    it('should correctly identify expired entries', () => {
      const now = Date.now();
      const expiredEntry = {
        data: mockData,
        timestamp: now - 10000, // 10 seconds ago
        ttl: 5000 // 5 second TTL
      };
      
      const validEntry = {
        data: mockData,
        timestamp: now,
        ttl: 60000 // 1 minute TTL
      };
      
      expect(service['isExpired'](expiredEntry)).toBe(true);
      expect(service['isExpired'](validEntry)).toBe(false);
    });
  });

  describe('getCacheKey', () => {
    it('should generate proper cache keys with prefix', () => {
      const key = service['getCacheKey']('test');
      expect(key).toBe(`${service['CACHE_PREFIX']}test`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large data objects', () => {
      const largeData = {
        items: new Array(1000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }))
      };
      
      expect(() => service.set(testKey, largeData)).not.toThrow();
      const result = service.get(testKey);
      expect(result).toEqual(largeData);
    });

    it('should handle null and undefined values', () => {
      service.set('null-key', null);
      service.set('undefined-key', undefined);
      
      expect(service.get('null-key')).toBeNull();
      expect(service.get('undefined-key')).toBeUndefined();
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key-with-!@#$%^&*()';
      service.set(specialKey, mockData);
      
      expect(service.get(specialKey)).toEqual(mockData);
    });

    it('should handle concurrent access', () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              service.set(`concurrent-${i}`, { index: i });
              resolve(service.get(`concurrent-${i}`));
            }, Math.random() * 10);
          })
        );
      }
      
      return Promise.all(promises).then(results => {
        results.forEach((result, index) => {
          expect(result).toEqual({ index });
        });
      });
    });
  });
});
