import { IPersistance } from './IPersistance';
//Simply store items in Memory
export class InMemory<T> implements IPersistance<T> {
    private persistance: Map<string, T>;

    constructor() {
        this.persistance = new Map();
    }
    has(key: string): boolean {
        return this.persistance.has(key);
    }
    keys(): IterableIterator<string> {
        return this.persistance.keys();
    }

    get(key: string): T | null {
        return this.persistance.get(key) || null;
    }

    set(key: string, value: T): void {
        this.persistance.set(key, value);
    }

    delete(key: string): void {
        this.persistance.delete(key);
    }

    size(): number {
        return this.persistance.size;
    }

    clear(): void {
        this.persistance.clear();
    }
}
