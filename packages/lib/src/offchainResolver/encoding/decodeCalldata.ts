import { log } from '../../shared/log';
import { DecodedCcipRequest } from '../types';
import { decodeText } from './decode/decodeText';
import { getResolverInterface } from './getResolverInterface';
/**
 * This function can be used to decode calldata return by the resolve method of the Offchain Resolver Smart Contract
 * This encoded calldata must have the following format
 * "resolve (decodeDnsName(name),text(namehash(name),record))""
 * To find out how to build the calldata you may check out {@see encodeFunctionData} {@see getResolverInterface}
 * or the unit test provided in this package
 * @param calldata the encoded calldata string
 * @returns {@see DecodedCcipRequest}
 */

export function decodeCalldata(calldata: string): DecodedCcipRequest {
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
            default:
                throw Error(`${signature} is not supported`);
        }
    } catch (err: any) {
        log("[Decode Calldata] Can't decode calldata ");
        log(err);
        throw err;
    }
}
