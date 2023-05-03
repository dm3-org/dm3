import { stringify } from './stringify';

export function createJsonDataUri(data: any): string {
    return 'data:application/json,' + stringify(data);
}
