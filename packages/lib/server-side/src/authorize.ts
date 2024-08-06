import { checkToken } from '@dm3-org/dm3-lib-delivery';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import request from 'supertest';
import winston from 'winston';
import ethers from 'ethers';

export async function authorize(
    req: Request,
    res: Response,
    next: NextFunction,
    ensName: string,
    hasAccount: (ensName: string) => Promise<boolean>,
    web3Provider: ethers.providers.JsonRpcProvider,
    serverSecret: string,
) {
    const normalizedEnsName = normalizeEnsName(ensName);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //TODO resolve addr for ens name
    if (
        token &&
        (await checkToken(
            web3Provider,
            hasAccount,
            normalizedEnsName,
            token,
            serverSecret,
        ))
    ) {
        next();
    } else {
        console.warn('AUTH Token check failed for ', normalizedEnsName);
        res.sendStatus(401);
    }
}
