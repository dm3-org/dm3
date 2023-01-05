import { ethers } from 'ethers';
import { UserProfile } from '../../account';
import { createKeyPair } from '../../crypto';
import { stringify } from '../../shared/stringify';

describe('signProfile', () => {
    it('test', async () => {
        const profile: UserProfile = {
            publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            deliveryServices: [''],
        };

        const mnemonic =
            'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        const profileSig = wallet.signMessage(stringify(profile));
    });
});
