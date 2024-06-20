import { ethers } from 'ethers';
import { IDatabase } from '../../../persistence/IDatabase';
import { interceptAddr } from './intercept';
import { logDebug } from '@dm3-org/dm3-lib-shared';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    console.log('resolve address for ', name);

    const interceptResult = interceptAddr(name);
    logDebug({
        text: '[Interceptor handleAddr]` result ',
        interceptResult,
    });

    if (interceptResult) {
        console.log('intercepted result for ', name, ' is ', interceptResult);
    }

    const container = await db.getProfileContainer(name);

    console.log('container for ', name, ' is ', container?.address);

    return interceptResult ?? container?.address;
}
