/* eslint-disable max-len */
import { ethers } from 'ethers';

export function decodeCalldata(calldata: string) {
    const iResolver = new ethers.utils.Interface([
        'function resolve(bytes calldata name, bytes calldata data) external view returns(bytes)',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
    ]);

    //Parse the calldata returned by a contra
    const [rawName, data] = iResolver.parseTransaction({ data: calldata }).args;

    //The naw has to be normalized be it can be processed
    const encodedName = ethers.utils.nameprep(rawName);

    const [nameHash, record] = iResolver.parseTransaction({
        data,
    }).args;

    const name = decodeDnsName(encodedName);

    if (ethers.utils.namehash(name) !== nameHash) {
        throw Error("Namehash doesn't match");
    }

    return { name, record };
}
/**
 * 

 * {@link https://github.com/ensdomains/offchain-resolver/blob/ed330e4322b1fafe2ffbd1496829c75185dd9e2e/packages/gateway/src/server.ts#L30}
*/
function decodeDnsName(dnsname: string) {
    //Create an Buffer of the name without the leading "0x" sequence
    const nameBuffer = Buffer.from(dnsname.slice(2), 'hex');
    const labels = [];
    let idx = 0;
    while (true) {
        const len = nameBuffer.readUInt8(idx);
        if (len === 0) break;
        labels.push(nameBuffer.slice(idx + 1, idx + len + 1).toString('utf8'));
        idx += len + 1;
    }
    return labels.join('.');
}
