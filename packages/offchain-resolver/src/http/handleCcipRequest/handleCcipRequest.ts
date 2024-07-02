import express from 'express';
import { handleAddr } from './handler/handleAddr';
import { handleText } from './handler/resolveText';
import { ethers } from 'ethers';

function getEthersFormat(address: string) {
    return ethers.utils.hexlify(address);
}

export async function handleCcipRequest(
    req: express.Request,
    signature: string,
    request: any,
) {
    switch (signature) {
        case 'text(bytes32,string)':
            console.info('Reading text(bytes32,string)');
            const profile = await handleText(req.app.locals.db, request);
            //If the profile is null, return without encoding.
            // The gateway returns 404 if the response is null
            if (!profile) {
                return null;
            }
            return ethers.utils.defaultAbiCoder.encode(['string'], [profile]);
        case 'addr(bytes32)':
            console.info('Reading addr(bytes32))');
            const address = await handleAddr(req.app.locals.db, request);
            if (!address) {
                return null;
            }
            const addressResult = getEthersFormat(address);
            console.debug({
                message: 'addr(bytes32,uint256)',
                addressResult,
                address,
            });

            return addressResult;
        case 'addr(bytes32,uint256)':
            console.info('Reading addr(bytes32,uint256))');
            const addressWithCoinType = await handleAddr(
                req.app.locals.db,
                request,
            );
            if (!addressWithCoinType) {
                return null;
            }

            const addressWithCoinTypeResult =
                getEthersFormat(addressWithCoinType);
            console.debug({
                message: 'addr(bytes32,uint256)',
                addressWithCoinTypeResult,
                addressWithCoinType,
            });

            return addressWithCoinTypeResult;

        default:
            return null;
    }
}
