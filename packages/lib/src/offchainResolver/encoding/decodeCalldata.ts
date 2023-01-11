import { ethers } from 'ethers';
import { log } from '../../shared/log';
import { decodeDnsName } from '../dns/decodeDnsName';
import { DecodedCcipRequest } from '../types';
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
        const [rawName, data] = textResolver.parseTransaction({
            data: calldata,
        }).args;

        //The name has to be normalized before be it can be processed
        const encodedName = ethers.utils.nameprep(rawName);

        const { signature, args } = textResolver.parseTransaction({
            data,
        });
        const [nameHash, record] = args;

        const name = decodeDnsName(encodedName);

        if (ethers.utils.namehash(name) !== nameHash) {
            throw Error("Namehash doesn't match");
        }

        return { name, record, signature };
    } catch (err: any) {
        log("[Decode Calldata] Can't decode calldata ");
        log(err);
        throw err;
    }
}
