import { ethers } from 'ethers';
import { IDatabase } from '../../../persistance/IDatabase';
import { interceptAddr } from './intercept';
import { log } from 'dm3-lib-shared';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const interceptResult = interceptAddr(name);
    log(
        '[Interceptor handleAddr] result ' + JSON.stringify(interceptResult),
        'debug',
    );

    return (
        interceptResult ??
        (await db.getAddressByName(ethers.utils.namehash(name)))
    );
}
