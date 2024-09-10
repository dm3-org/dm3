import safeStringify from 'safe-stable-stringify';

export function stringify(value: any) {
    const jsonString = safeStringify(value);

    if (typeof jsonString !== 'string') {
        throw 'Invalid stringified input';
    }
    return jsonString;
}
