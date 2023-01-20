import { ethers } from 'ethers';
import { stringify } from 'querystring';
import { UserProfile } from '../../account';
import { encodeEnsName } from '../dns/encodeEnsName';
import { encodeResponse } from './encodeResponse';
import { getResolverInterface } from './getResolverInterface';

describe('encodeResponse', () => {
    it('encodes userProfile properly', async () => {
        const signer = ethers.Wallet.createRandom();
        const response: string =
            'data:application/json,' +
            stringify({
                publicSigningKey:
                    '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            });

        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash('foo.dm3.eth'),
            'dm3.profile',
        ]);

        const calldata = getResolverInterface().encodeFunctionData('resolve', [
            encodeEnsName('foo.dm3.eth'),
            textData,
        ]);

        const functionSelector = 'text(bytes32,string)';

        const encodedProfile = await encodeResponse(
            signer,
            signer.address,
            response,
            calldata,
            functionSelector,
        );
        const [encodedResult] = ethers.utils.defaultAbiCoder.decode(
            ['bytes', 'uint64', 'bytes'],
            encodedProfile,
        );

        const [decodedProfile] = getResolverInterface().decodeFunctionResult(
            'text',
            encodedResult,
        );

        expect(decodedProfile).toStrictEqual(response);
    });
});
