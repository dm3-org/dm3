import { ethers } from 'ethers';
import { decodeCalldata } from './decodeCalldata';
import { getResolverInterface } from './getResolverInterface';
describe('decodeCalldata', () => {
    it('decodes valid calldata', () => {
        const calldata =
            // eslint-disable-next-line max-len
            '0x9061b92300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000d03666f6f03646d33036574680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008459d1d43c1bfb19db9bbac11d0bfb5715c756d408fc4245578cff33dc150441a3d72a6b530000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f6574682e646d332e70726f66696c65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

        const { record, name, signature } = decodeCalldata(calldata);

        expect(record).toBe('eth.dm3.profile');
        expect(name).toBe('foo.dm3.eth');
        expect(signature).toBe('text(bytes32,string)');
    });

    it('throws if namehash does not matched encoded ens.name', () => {
        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash(ethers.utils.nameprep('FOOO')),
            'eth.profile.dm3',
        ]);

        const calldata = getResolverInterface().encodeFunctionData('resolve', [
            dnsName('foo.dm3.eth'),
            textData,
        ]);

        expect(() => decodeCalldata(calldata)).toThrowError(
            "Namehash doesn't match",
        );
    });
});
function dnsName(name: string) {
    // strip leading and trailing .
    const n = name.replace(/^\.|\.$/gm, '');

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
