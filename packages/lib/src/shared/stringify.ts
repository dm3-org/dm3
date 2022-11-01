import safeStringify, { Replacer } from 'safe-stable-stringify';

export function stringify(value: object, replacer?: Replacer) {
    const jsonString = safeStringify(value);

    if (typeof jsonString !== 'string') {
        throw 'Invalid stringified input';
    }
    return jsonString;
}
