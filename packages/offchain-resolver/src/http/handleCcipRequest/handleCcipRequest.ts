import express from 'express';
import { handleAddr } from './handler/handleAddr';
import { handleText } from './handler/resolveText';
import { ethers } from 'ethers';
export async function handleCcipRequest(
    req: express.Request,
    signature: string,
    request: any,
) {
    switch (signature) {
        case 'text(bytes32,string)':
            req.app.locals.logger.info('Reading text(bytes32,string)');
            const profile = await handleText(req.app.locals.db, request);
            //If the profile is null, return without encoding. The gateway returns 404 if the response is null
            if (!profile) {
                return null;
            }
            return ethers.utils.defaultAbiCoder.encode(['string'], [profile]);
        case 'addr(bytes32)':
            req.app.locals.logger.info('Reading addr(bytes32))');
            return await handleAddr(req.app.locals.db, request);
        case 'addr(bytes32,uint256)':
            req.app.locals.logger.info('Reading addr(bytes32,uint256))');
            return await handleAddr(req.app.locals.db, request);

        default:
            return null;
    }
}
