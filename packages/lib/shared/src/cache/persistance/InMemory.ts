import { IPersistance } from './IPersistance';
//Simply store items in Memory
export class InMemory<T> implements IPersistance<T> {
    private readonly persistance: Map<string, T>;

    constructor(persistance: Map<string, T> = new Map()) {
        this.persistance = persistance;
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
    serialize(): string {
        return JSON.stringify(Array.from(this.persistance.entries()));
    }

    static fromJson<T>(json: string): InMemory<T> {
        const entries = JSON.parse(json) as [string, T][];
        return new InMemory<T>(new Map(entries));
    }
}
