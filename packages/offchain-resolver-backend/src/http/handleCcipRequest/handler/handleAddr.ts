import { ethers } from 'ethers';
import { IDatabase } from '../../../persistance/IDatabase';
import { interceptAddr } from './intercept';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const interceptResult = interceptAddr(name);

    return (
        interceptResult ??
        (await db.getAddressByName(ethers.utils.namehash(name)))
    );
}
