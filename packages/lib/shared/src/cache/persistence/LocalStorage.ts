import { IPersistance } from './IPersistance';
import { InMemory } from './InMemory';

// Store items in LocalStorage. It uses an impelmentation of InMemory to store the items in memory and persist them in LocalStorage
export class LocalStorage<T> implements IPersistance<T> {
    private memory: InMemory<T>;
    private readonly storageKey: string =
        'DM3-LocalStorage-Web3-Provider-Cache';

    constructor() {
        this.memory = new InMemory<T>();
    }

    private loadFromLocalStorage() {
        //If LocalStorage is not available, we don't need to do anything
        if (!localStorage) {
            return;
        }
        const json = localStorage.getItem(this.storageKey);
        // If there is no data in LocalStorage, we don't need to do anything.
        // Can also happen if the user has disabled LocalStorage
        //In this case we will use the default InMemory implementation
        if (!json) {
            return;
        }
        //Load the updated data from LocalStorage
        this.memory = InMemory.fromJson(json);
    }
    private saveToLocalStorage() {
        //If LocalStorage is not available, we don't need to do anything
        if (!localStorage) {
            return;
        }
        //Serialize the data and store it in LocalStorage
        const serialized = this.memory.serialize();
        localStorage.setItem(this.storageKey, serialized);
    }

    has(key: string): boolean {
        this.loadFromLocalStorage();
        return this.memory.has(key);
    }
    get(key: string): T | null {
        this.loadFromLocalStorage();
        return this.memory.get(key);
    }
    set(key: string, value: T): void {
        this.memory.set(key, value);
        this.saveToLocalStorage();
    }
    delete(key: string): void {
        this.memory.delete(key);
        this.saveToLocalStorage();
    }
    size(): number {
        this.loadFromLocalStorage();
        return this.memory.size();
    }
    clear(): void {
        this.memory.clear();
        this.saveToLocalStorage();
    }
    keys(): IterableIterator<string> {
        this.loadFromLocalStorage();
        return this.memory.keys();
    }
}
