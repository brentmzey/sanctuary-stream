/**
 * High-performance memoization utilities for functional TypeScript
 * Used to cache expensive computations and avoid redundant work
 */

/**
 * Simple memoization for single-argument functions
 * O(1) lookup using Map for maximum performance
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  
  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Memoization for functions with JSON-serializable arguments
 * Uses stable JSON serialization as cache key
 */
export function memoizeBy<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => R {
  const cache = new Map<string, R>();
  
  return (...args: Args): R => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Memoization with TTL (time-to-live) for cache invalidation
 * Useful for API responses or data that changes over time
 */
export function memoizeWithTTL<T, R>(
  fn: (arg: T) => R,
  ttlMs: number
): (arg: T) => R {
  const cache = new Map<T, { value: R; timestamp: number }>();
  
  return (arg: T): R => {
    const now = Date.now();
    const cached = cache.get(arg);
    
    if (cached && now - cached.timestamp < ttlMs) {
      return cached.value;
    }
    
    const result = fn(arg);
    cache.set(arg, { value: result, timestamp: now });
    return result;
  };
}

/**
 * Debounce function calls - only execute after quiet period
 * Useful for expensive operations triggered by user input
 */
export function debounce<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Args): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Throttle function calls - execute at most once per interval
 * Useful for rate-limiting API calls or event handlers
 */
export function throttle<Args extends readonly unknown[]>(
  fn: (...args: Args) => void,
  intervalMs: number
): (...args: Args) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Args): void => {
    const now = Date.now();
    
    if (now - lastRun >= intervalMs) {
      fn(...args);
      lastRun = now;
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        fn(...args);
        lastRun = Date.now();
        timeoutId = null;
      }, intervalMs - (now - lastRun));
    }
  };
}

/**
 * Lazy evaluation - compute value only when first accessed
 * Memoizes result for subsequent accesses
 */
export class Lazy<T> {
  private computed = false;
  private value: T | undefined;
  
  constructor(private readonly computation: () => T) {}
  
  get(): T {
    if (!this.computed) {
      this.value = this.computation();
      this.computed = true;
    }
    return this.value!;
  }
  
  map<U>(mapper: (value: T) => U): Lazy<U> {
    return new Lazy(() => mapper(this.get()));
  }
}

/**
 * Create a lazy value
 */
export function lazy<T>(computation: () => T): Lazy<T> {
  return new Lazy(computation);
}
