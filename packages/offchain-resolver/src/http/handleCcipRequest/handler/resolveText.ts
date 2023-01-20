import { IDatabase } from '../../../persistance/IDatabase';
import * as Lib from 'dm3-lib/dist.backend';

export async function handleText(db: IDatabase, request: any) {
    const { record, name } = request;

    if (record !== 'dm3.profile') {
        throw Error(`${record} Record is not supported by this resolver`);
    }

    const userProfile = await db.getUserProfile(name);

    return userProfile
        ? 'data:application/json,' + Lib.stringify(userProfile)
        : null;
}
