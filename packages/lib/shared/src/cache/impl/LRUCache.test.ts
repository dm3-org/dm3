import { LRUCache } from './LRUCache';

describe('LRUCache', () => {
    let cache: LRUCache<number>;

    beforeEach(() => {
        cache = new LRUCache<number>(3);
    });

    it('should set and get values correctly', () => {
        cache.set('key1', 1);
        expect(cache.get('key1')).toBe(1);
    });

    it('should return undefined for non-existent keys', () => {
        expect(cache.get('nonExistentKey')).toBeUndefined();
    });

    it('should overwrite existing keys', () => {
        cache.set('key1', 1);
        cache.set('key1', 2);
        expect(cache.get('key1')).toBe(2);
    });

    it('should respect capacity and evict least recently used item', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);
        cache.set('key4', 4);
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBe(2);
        expect(cache.get('key3')).toBe(3);
        expect(cache.get('key4')).toBe(4);
    });

    it('should return correct length', () => {
        expect(cache.length()).toBe(0);
        cache.set('key1', 1);
        expect(cache.length()).toBe(1);
    });

    it('should clear cache correctly', () => {
        cache.set('key1', 1);
        cache.clear();
        expect(cache.length()).toBe(0);
    });
});
