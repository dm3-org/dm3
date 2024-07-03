//Simple Cache interface
export interface ICache<T> {
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    has(key: string): boolean;
    length(): number;
    clear(): void;
}
