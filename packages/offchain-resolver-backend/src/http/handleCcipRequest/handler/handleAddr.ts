import { ethers } from 'ethers';
import { IDatabase } from '../../../persistance/IDatabase';
import { interceptAddr } from './intercept';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const interceptResult = interceptAddr(name);
    console.log('addr interceptResult');
    console.log(interceptResult);

    return (
        interceptResult ??
        (await db.getAddressByName(ethers.utils.namehash(name)))
    );
}
