import { stringify } from 'dm3-lib-shared';

/**
 * This function calculates the size in bytes of the input value.
 * It first converts the input value to a JSON string using the stringify function.
 * Then, it creates a Buffer from the JSON string and returns its length in bytes.
 *
 * @param {any} value - The value whose size is to be calculated.
 * @returns {number} The size of the input value in bytes.
 */
export function getSize(value: any) {
    return Buffer.byteLength(stringify(value), 'utf-8');
}
