import { ethers } from 'ethers';
import { decodeDnsName } from '../../dns/decodeDnsName';

/**
Decodes the text record of a given ENS name and returns an object containing the name and the record.
@param ensName - The ENS name to be decoded.
@param data - The data containing the namehash and the record.
@returns An object containing the name and the record.
@throws An error if the namehash doesn't match the ENS name.
*/
export function decodeText(ensName: string, data: ethers.utils.Result) {
    const [nameHash, record] = data;

    const name = decodeDnsName(ensName);

    if (ethers.utils.namehash(name) !== nameHash) {
        throw Error("Namehash doesn't match");
    }

    return { name, record };
}
