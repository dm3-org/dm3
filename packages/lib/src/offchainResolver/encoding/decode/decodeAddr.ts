import { ethers } from 'ethers';
import { namehash } from 'ethers/lib/utils';
import { decodeDnsName } from '../../dns/decodeDnsName';

export function decodeAddr(ensName: string, data: ethers.utils.Result) {
    const [nameHash] = data;

    const name = decodeDnsName(ensName);

    if (ethers.utils.namehash(name) !== nameHash) {
        throw Error("Namehash doesn't match");
    }

    return { name };
}
