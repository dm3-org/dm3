import { IPersistance } from '../persistence/IPersistance';
import { ICache } from './ICache';

export type TTLCacheItem<T> = {
    value: T;
    timestamp: number;
};

// Cache using a time-based strategy to keep values for a given time
export class TTLCache<T> implements ICache<T> {
    private capacity: number;
    private persitance: IPersistance<TTLCacheItem<T>>;
    private ttl: number; // time to live in milliseconds

    constructor(
        capacity: number,
        ttl: number,
        persistence: IPersistance<TTLCacheItem<T>>,
    ) {
        this.capacity = capacity;
        this.ttl = ttl;
        this.persitance = persistence;
    }

    get(key: string): T | undefined {
        const item = this.persitance.get(key);
        if (!item || Date.now() - item.timestamp > this.ttl) {
            this.persitance.delete(key);
            return undefined;
        }
        return item.value;
    }

    set(key: string, value: T): void {
        this.persitance.set(key, { value, timestamp: Date.now() });
        if (this.persitance.size() > this.capacity) {
            const firstKey = this.persitance.keys().next().value;
            this.persitance.delete(firstKey);
        }
    }

    has(key: string): boolean {
        return this.persitance.has(key);
    }

    length(): number {
        return this.persitance.size();
    }

    clear(): void {
        this.persitance.clear();
    }
}
