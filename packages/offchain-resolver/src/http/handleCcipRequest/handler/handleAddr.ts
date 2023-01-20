import { IDatabase } from '../../../persistance/IDatabase';
import express from 'express';
import { ethers } from 'ethers';

export async function handleAddr(db: IDatabase, request: any) {
    const { name } = request;

    const addr = await db.getAddressByName(ethers.utils.namehash(name));
    return addr;
}
