import { IPersistance } from './IPersistance';
//Simply store items in Memory
export class InMemory<T> implements IPersistance<T> {
    private readonly persistence: Map<string, T>;

    constructor(persistence: Map<string, T> = new Map()) {
        this.persistence = persistence;
    }
    has(key: string): boolean {
        return this.persistence.has(key);
    }
    keys(): IterableIterator<string> {
        return this.persistence.keys();
    }

    get(key: string): T | null {
        return this.persistence.get(key) || null;
    }

    set(key: string, value: T): void {
        this.persistence.set(key, value);
    }

    delete(key: string): void {
        this.persistence.delete(key);
    }

    size(): number {
        return this.persistence.size;
    }

    clear(): void {
        this.persistence.clear();
    }
    serialize(): string {
        return JSON.stringify(Array.from(this.persistence.entries()));
    }

    static fromJson<T>(json: string): InMemory<T> {
        const entries = JSON.parse(json) as [string, T][];
        return new InMemory<T>(new Map(entries));
    }
}
