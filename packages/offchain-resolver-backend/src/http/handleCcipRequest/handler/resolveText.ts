import { IDatabase } from '../../../persistance/IDatabase';
import { PROFILE_RECORD_NAME } from 'dm3-lib-profile/dist.backend';
import { stringify } from 'dm3-lib-shared/dist.backend';
import { interceptTextRecord } from './intercept';

export async function handleText(db: IDatabase, request: any) {
    const { record, name } = request;

    if (record !== PROFILE_RECORD_NAME) {
        throw Error(`${record} Record is not supported by this resolver`);
    }

    const interceptResult = interceptTextRecord(name, record);
    console.log('text interceptResult');
    console.log(interceptResult);

    if (interceptResult) {
        return interceptResult;
    }

    const userProfile = await db.getUserProfile(name);

    return userProfile
        ? 'data:application/json,' + stringify(userProfile)
        : null;
}
