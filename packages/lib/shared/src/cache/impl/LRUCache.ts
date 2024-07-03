//Simple cache using LRU as a cache strategy to keep the most recent values

import { ICache } from './ICache';

//Thanks to Gashawk.io for the implementation
export class LRUCache<T> implements ICache<T> {
    private capacity: number;
    private cache: Map<string, T>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key: string): T | undefined {
        if (!this.cache.has(key)) {
            return undefined;
        }
        const value = this.cache.get(key)!;
        // Remove the key and re-insert it to update its position (most recently used)
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key: string, value: T): void {
        if (this.cache.has(key)) {
            // Remove the key to update its position (most recently used)
            this.cache.delete(key);
        } else if (this.cache.size === this.capacity) {
            // Remove the least recently used (first) entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    length(): number {
        return this.cache.size;
    }

    clear(): void {
        this.cache.clear();
    }
}
