import { IDatabase } from '../../../persistance/IDatabase';
import express from 'express';
import { ethers } from 'ethers';

export async function handleAddr(
    res: express.Response,
    db: IDatabase,
    request: any,
) {
    const { name } = request;

    const addr = await db.getAddressByName(ethers.utils.namehash(name));
    if (!addr) {
        return res.status(404).send({ message: 'Name not found' });
    }
    return addr;
}
