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
            return ethers.utils.defaultAbiCoder.encode(
                ['string'],
                [await handleText(req.app.locals.db, request)],
            );
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
