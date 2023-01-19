import { ethers } from 'ethers';
import { decodeDnsName } from '../../dns/decodeDnsName';

/**
Decodes the call data of addr(bytes 32) 
@param ensName - The ENS name to be decoded.
@param data - The data containing the namehash.
@returns An object containing the name.
@throws An error if the namehash doesn't match the ENS name.
*/
export function decodeAddr(ensName: string, data: ethers.utils.Result) {
    const [nameHash] = data;

    const name = decodeDnsName(ensName);

    if (ethers.utils.namehash(name) !== nameHash) {
        throw Error("Namehash doesn't match");
    }

    return { name };
}
