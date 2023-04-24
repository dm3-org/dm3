/* eslint-disable max-len */
/**
 * Decodes an DNS name to an ENS name
 * {@link https://github.com/ensdomains/offchain-resolver/blob/ed330e4322b1fafe2ffbd1496829c75185dd9e2e/packages/gateway/src/server.ts#L30}
 */
export function decodeDnsName(dnsname: string) {
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
