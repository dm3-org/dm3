import { log } from '../shared/log';

export const FILE_NAME = 'ensmail';

export function getTimestamp(file: { name: string }): number | undefined {
    const parsedName = file.name.split('-');
    try {
        return parsedName.length === 2 && parsedName[0] === FILE_NAME
            ? parseInt(parsedName[1].split('.')[0])
            : undefined;
    } catch (e) {
        log(e as string);
        return;
    }
}

export function createTimestamp(): number {
    return new Date().getTime();
}
