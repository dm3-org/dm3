import { ethers } from 'ethers';
import { IDatabase } from '../../../persistance/IDatabase';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const addr = await db.getAddressByName(ethers.utils.namehash(name));
    return addr;
}
