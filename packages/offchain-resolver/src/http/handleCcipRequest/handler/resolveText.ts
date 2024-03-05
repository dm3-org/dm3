import { IDatabase } from '../../../persistence/IDatabase';
import { PROFILE_RECORD_NAME } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { interceptTextRecord } from './intercept';
import { logDebug } from '@dm3-org/dm3-lib-shared';

export async function handleText(db: IDatabase, request: any) {
    const { record, name } = request;

    const interceptResult = interceptTextRecord(name, record);
    logDebug({ text: '[Interceptor handleText] result ', interceptResult });

    if (interceptResult) {
        return interceptResult;
    }
    if (record !== PROFILE_RECORD_NAME) {
        throw Error(`${record} Record is not supported by this resolver`);
    }

    const profileContainer = await db.getProfileContainer(name);

    return profileContainer
        ? 'data:application/json,' + stringify(profileContainer.profile)
        : null;
}
