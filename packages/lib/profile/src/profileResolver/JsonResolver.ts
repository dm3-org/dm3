import { logInfo } from '@dm3-org/dm3-lib-shared';
import { decode, labelToName } from 'whatwg-encoding';
import { Dm3Profile, ProfileResolver } from './ProfileResolver';

function parseDataUrl(dataUri: string) {
    const regex =
        /^data:(?<mime>[\w+.-]+\/[\w+.-]+)(;charset=(?<charset>[\w-]+))?(;(?<encoding>\w+))?,(?<data>.*)$/;
    const match = regex.exec(dataUri);

    if (!match || !match.groups) {
        throw Error(`Couldn't parse data uri`);
    }

    return {
        mime: match.groups.mime,
        charset: match.groups.charset,
        encoding: match.groups.encoding,
        data: match.groups.data,
    };
}

function isProfile(textRecord: string) {
    try {
        return parseDataUrl(textRecord).mime === 'application/json';
    } catch (e) {
        return false;
    }
}

function resolveProfile<T>(validate: (objectToCheck: T) => boolean) {
    return async <T>(textRecord: string): Promise<T> => {
        logInfo(`[getUserProfile] Resolve User Json profile `);

        const dataUrl = parseDataUrl(textRecord);

        if (!dataUrl) {
            throw Error(`Couldn't parse data uri`);
        }
        const encodingName = labelToName(dataUrl.charset || 'utf-8');

        if (!encodingName) {
            throw Error(`Couldn't parse data uri (encoding error).`);
        }

        const bodyDecoded = decode(
            Uint8Array.from(dataUrl.data, (c) => c.charCodeAt(0)),
            encodingName,
        );

        const profile = JSON.parse(
            dataUrl.encoding === 'base64'
                ? Buffer.from(bodyDecoded, 'base64').toString()
                : bodyDecoded,
        );

        if (!validate(profile)) {
            throw Error("Profile doesn't fit schema");
        }
        return profile;
    };
}

export function JsonResolver<T extends Dm3Profile>(
    validate: (objectToCheck: T) => boolean,
): ProfileResolver<T> {
    return {
        isProfile,
        resolveProfile: resolveProfile(validate),
    };
}
