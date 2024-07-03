import { ICache } from './ICache';

// Cache using a time-based strategy to keep values for a given time
export class TTLCache<T> implements ICache<T> {
    private capacity: number;
    private cache: Map<string, { value: T; timestamp: number }>;
    private ttl: number; // time to live in milliseconds

    constructor(capacity: number, ttl: number) {
        this.capacity = capacity;
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key: string): T | undefined {
        const item = this.cache.get(key);
        if (!item || Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }

    set(key: string, value: T): void {
        this.cache.set(key, { value, timestamp: Date.now() });
        if (this.cache.size > this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
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
