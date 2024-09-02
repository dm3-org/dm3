//Simple cache using LRU as a cache strategy to keep the most recent values

import { IPersistance } from '../persistence/IPersistance';
import { InMemory } from '../persistence/InMemory';
import { ICache } from './ICache';

//Thanks to Gashawk.io for the implementation
export class LRUCache<T> implements ICache<T> {
    private capacity: number;
    private persistence: IPersistance<T>;

    constructor(
        capacity: number,
        persistence: IPersistance<T> = new InMemory(),
    ) {
        this.capacity = capacity;
        this.persistence = persistence;
    }

    get(key: string): T | undefined {
        if (!this.persistence.has(key)) {
            return undefined;
        }
        const value = this.persistence.get(key)!;
        // Remove the key and re-insert it to update its position (most recently used)
        this.persistence.delete(key);
        this.persistence.set(key, value);
        return value;
    }

    set(key: string, value: T): void {
        if (this.persistence.has(key)) {
            // Remove the key to update its position (most recently used)
            this.persistence.delete(key);
        } else if (this.persistence.size() === this.capacity) {
            // Remove the least recently used (first) entry
            const firstKey = this.persistence.keys().next().value;
            this.persistence.delete(firstKey);
        }
        this.persistence.set(key, value);
    }

    has(key: string): boolean {
        return this.persistence.has(key);
    }

    length(): number {
        return this.persistence.size();
    }

    clear(): void {
        this.persistence.clear();
    }
}
