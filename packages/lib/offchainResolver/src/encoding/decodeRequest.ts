import { log } from 'dm3-lib-shared';
import { DecodedCcipRequest } from '../types';
import { decodeAddr } from './decode/decodeAddr';
import { decodeText } from './decode/decodeText';
import { getResolverInterface } from './getResolverInterface';

/**
Decodes a given calldata string and returns a DecodedCcipRequest object containing the signature and request.
@param calldata - The calldata string to be decoded.
@returns A {@see DecodedCcipRequest} object containing the signature and request.
@throws An error if the calldata cannot be decoded or if the signature is not supported.
*/
export function decodeRequest(calldata: string): DecodedCcipRequest {
    try {
        const textResolver = getResolverInterface();

        //Parse the calldata returned by a contra
        const [ensName, data] = textResolver.parseTransaction({
            data: calldata,
        }).args;

        const { signature, args } = textResolver.parseTransaction({
            data,
        });

        switch (signature) {
            case 'text(bytes32,string)':
                return { signature, request: decodeText(ensName, args) };
            case 'addr(bytes32)':
                return { signature, request: decodeAddr(ensName, args) };
            default:
                throw Error(`${signature} is not supported`);
        }
    } catch (err: any) {
        log(
            `[Decode Calldata] Can't decode calldata ` + JSON.stringify(err),
            'error',
        );

        throw err;
    }
}
