//Decouple the cache from the persistence layer
export interface IPersistance<T> {
    has(key: string): boolean;
    get(key: string): T | null;
    set(key: string, value: T): void;
    delete(key: string): void;
    size(): number;
    clear(): void;
    keys(): IterableIterator<string>;
}
