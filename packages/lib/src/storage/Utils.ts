import { log } from '../shared/log';

export const FILE_NAME_PREFIX = 'dm3';

export function getTimestamp(file: { name: string }): number | undefined {
    /**
     * The filename of an dm3 storgefile has to be the following format : "FILE_NAME_PREFIX-timestamp"
     * i:E. dm3-123456
     */
    const parsedName = file.name.split('-');

    const [dm3Prefix, timeStampString] = parsedName;

    const isValidFileName =
        parsedName.length === 2 && dm3Prefix === FILE_NAME_PREFIX;

    //In order to extract the timeStamp, a file has to corresponds to the dm3 storage file naming pattern
    if (!isValidFileName) {
        log('Invalid filename');
        return undefined;
    }
    //If a float number was provided as a timestamp only the int part will be returned
    const [integerString] = timeStampString.split('.');

    const timeStamp = parseInt(integerString);
    //The timestamp has to be a number in order to get parsed
    if (isNaN(timeStamp)) {
        log('timestamp has to be a number. Given: ' + integerString);
        return undefined;
    }

    return timeStamp;
}

export function createTimestamp(): number {
    return new Date().getTime();
}
