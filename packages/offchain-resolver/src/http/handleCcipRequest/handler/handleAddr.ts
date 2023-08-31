import { ethers } from 'ethers';
import { IDatabase } from '../../../persistance/IDatabase';
import { interceptAddr } from './intercept';
import { logDebug } from 'dm3-lib-shared';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const interceptResult = interceptAddr(name);
    logDebug({
        text: '[Interceptor handleAddr]` result ',
        interceptResult,
    });

    return interceptResult ?? (await db.getProfileContainer(name))?.address;
}
