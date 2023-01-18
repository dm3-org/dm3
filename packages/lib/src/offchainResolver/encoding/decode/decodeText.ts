import { ethers } from 'ethers';
import { decodeDnsName } from '../../dns/decodeDnsName';

export function decodeText(ensName: string, data: ethers.utils.Result) {
    const [nameHash, record] = data;

    const name = decodeDnsName(ensName);

    if (ethers.utils.namehash(name) !== nameHash) {
        throw Error("Namehash doesn't match");
    }

    return { name, record };
}
