/* eslint-disable max-len */
/* Encodes an ensName to an dns compliant format
 * https://github.com/ensdomains/offchain-resolver/blob/ed330e4322b1fafe2ffbd1496829c75185dd9e2e/packages/gateway/test/e2e.test.ts#L193
 * @param ensName the ensname in the format foo.bar.eth
 * @returns the dns encoded name
 */
export function encodeEnsName(ensName: string) {
    // strip leading and trailing .
    const n = ensName.replace(/^\.|\.$/gm, '');

    var bufLen = n === '' ? 1 : n.length + 2;
    var buf = Buffer.allocUnsafe(bufLen);

    let offset = 0;
    if (n.length) {
        const list = n.split('.');
        for (let i = 0; i < list.length; i++) {
            const len = buf.write(list[i], offset + 1);
            buf[offset] = len;
            offset += len + 1;
        }
    }
    buf[offset++] = 0;
    return (
        '0x' +
        buf.reduce(
            (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
            '',
        )
    );
}
