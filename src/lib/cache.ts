/**
 * Simple in-memory cache with TTL (Time To Live)
 * This helps reduce unnecessary API calls by caching frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) { // Default 1 minute
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get data from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Remove specific key from cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Remove all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or fetch data with automatic caching
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Export a singleton instance
export const cache = new SimpleCache(120000); // 2 minutes default TTL

// Export cache keys as constants to avoid typos
export const CACHE_KEYS = {
  USER: (uid: string) => `user:${uid}`,
  PETITIONS_BY_CREATOR: (creatorId: string) => `petitions:creator:${creatorId}`,
  PETITIONS_BY_CITY: (city: string) => `petitions:city:${city}`,
  PETITION: (id: string) => `petition:${id}`,
};

// Helper to invalidate related caches when a petition is created/updated
export const invalidatePetitionCaches = (creatorId?: string, city?: string) => {
  if (creatorId) {
    cache.invalidate(CACHE_KEYS.PETITIONS_BY_CREATOR(creatorId));
  }
  if (city) {
    cache.invalidate(CACHE_KEYS.PETITIONS_BY_CITY(city));
  }
  // Also invalidate any petition detail caches
  cache.invalidatePattern('^petition:');
};
