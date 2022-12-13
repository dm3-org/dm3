import parseDataURL from 'data-urls';
import { log } from '../../shared/log';
import { decode, labelToName } from 'whatwg-encoding';
import { Dm3Profile, ProfileResolver } from './ProfileResolver';

function isProfile(textRecord: string) {
    const dataUrl = parseDataURL(textRecord);
    if (
        !dataUrl ||
        dataUrl.mimeType.type !== 'application' ||
        dataUrl.mimeType.subtype !== 'json'
    ) {
        return false;
    } else {
        return true;
    }
}

function resolveProfile<T>(validate: (objectToCheck: T) => boolean) {
    return async <T>(textRecord: string): Promise<T> => {
        log(`[getUserProfile] Resolve User Json profile `);

        const dataUrl = parseDataURL(textRecord);

        if (!dataUrl) {
            throw Error(`Couldn't parse data uri`);
        }
        const encodingName = labelToName(
            dataUrl.mimeType.parameters.get('charset') || 'utf-8',
        );

        const bodyDecoded = decode(dataUrl.body, encodingName!);

        const profile = JSON.parse(bodyDecoded);

        if (!validate(profile)) {
            throw Error("SignedUserProfileSchema doesn't fit schema");
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
