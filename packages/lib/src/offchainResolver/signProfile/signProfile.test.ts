import { ethers } from 'ethers';
import { UserProfile } from '../../account';
import { stringify } from '../../shared/stringify';
import { signProfile } from './signProfile';

describe('signProfile', () => {
    it('signs a Userprofile ', async () => {
        const profile: UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const walletSinger1 = ethers.Wallet.createRandom();

        const walletSinger2 = ethers.Wallet.createRandom();

        const offChainProfile = await signProfile(
            [walletSinger1, walletSinger2],
            profile,
        );

        const addrSigner1 = ethers.utils.verifyMessage(
            stringify(offChainProfile.profile),
            offChainProfile.signatures[0],
        );
        const addrSigner2 = ethers.utils.verifyMessage(
            stringify(offChainProfile.profile),
            offChainProfile.signatures[1],
        );

        expect(addrSigner1).toEqual(walletSinger1.address);
        expect(addrSigner2).toEqual(walletSinger2.address);
    });
});
