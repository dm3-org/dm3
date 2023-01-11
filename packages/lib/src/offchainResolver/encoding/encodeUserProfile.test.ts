import { ethers } from 'ethers';
import { UserProfile } from '../../account';
import { stringify } from '../../shared/stringify';
import { encodeEnsName } from '../dns/encodeEnsName';
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
            encodeEnsName('foo.dm3.eth'),
            textData,
        ]);

        const functionSelector = 'text(bytes32,string)';

        const encodedProfile = await encodeUserProfile(
            signer,
            profile,
            signer.address,
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
        expect(JSON.parse(decodedProfile)).toStrictEqual(profile);
    });
});
