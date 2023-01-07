import { ethers } from 'ethers';
import { UserProfile } from '../../account';
import { stringify } from '../../shared/stringify';
import { encodeUserProfile } from './encodeUserProfile';
import { getResolverInterface } from './getResolverInterface';

describe('encodeUserProfie', () => {
    it('encodes userProfile properly', async () => {
        const signer = ethers.Wallet.createRandom();
        const profile: UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash('foo.dm3.eth'),
            'profile.dm3.eth',
        ]);

        const calldata = getResolverInterface().encodeFunctionData('resolve', [
            dnsName('foo.dm3.eth'),
            textData,
        ]);

        const functionSelector = 'text(bytes32,string)';

        const { userProfile, validUntil, sigData } = await encodeUserProfile(
            signer,
            profile,
            signer.address,
            calldata,
            functionSelector,
        );

        const hash = ethers.utils.solidityKeccak256(
            ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
            [
                '0x1900',
                signer.address,
                validUntil,
                ethers.utils.keccak256(calldata),
                ethers.utils.keccak256(
                    getResolverInterface().encodeFunctionResult(
                        functionSelector,
                        [stringify(userProfile)],
                    ),
                ),
            ],
        );

        const pack = ethers.utils.keccak256(
            ethers.utils.solidityPack(
                ['string', 'string', 'bytes'],
                [
                    '\x19Ethereum Signed Message:\n',
                    String.fromCharCode(hash.length),
                    hash,
                ],
            ),
        );
        //TODO add assertion
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
