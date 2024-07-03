//Simple cache using LRU as a cache strategy to keep the most recent values

import { IPersistance } from '../persistance/IPersistance';
import { InMemory } from '../persistance/InMemory';
import { ICache } from './ICache';

//Thanks to Gashawk.io for the implementation
export class LRUCache<T> implements ICache<T> {
    private capacity: number;
    private persistance: IPersistance<T>;

    constructor(
        capacity: number,
        persistance: IPersistance<T> = new InMemory(),
    ) {
        this.capacity = capacity;
        this.persistance = persistance;
    }

    get(key: string): T | undefined {
        if (!this.persistance.has(key)) {
            return undefined;
        }
        const value = this.persistance.get(key)!;
        // Remove the key and re-insert it to update its position (most recently used)
        this.persistance.delete(key);
        this.persistance.set(key, value);
        return value;
    }

    set(key: string, value: T): void {
        if (this.persistance.has(key)) {
            // Remove the key to update its position (most recently used)
            this.persistance.delete(key);
        } else if (this.persistance.size() === this.capacity) {
            // Remove the least recently used (first) entry
            const firstKey = this.persistance.keys().next().value;
            this.persistance.delete(firstKey);
        }
        this.persistance.set(key, value);
    }

    has(key: string): boolean {
        return this.persistance.has(key);
    }

    length(): number {
        return this.persistance.size();
    }

    clear(): void {
        this.persistance.clear();
    }
}
