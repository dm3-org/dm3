import { ethers } from 'ethers';
import { sha256 } from 'ethers/lib/utils';
import { getUserProfile } from '../../session/getUserProfile';
import { stringify } from '../../shared/src/stringify';

import { StorageLocation } from '../../storage/Storage';

import { Connection, ConnectionState } from '../../web3-provider/Web3Provider';
import {
    Account,
    checkProfileHash,
    checkStringSignature,
    checkUserProfile,
    getAccountDisplayName,
    getBrowserStorageKey,
    getProfileCreationMessage,
    normalizeEnsName,
    PROFILE_RECORD_NAME,
    SignedUserProfile,
    UserProfile,
} from './Account';

const connection: Connection = {
    connectionState: ConnectionState.SignedIn,
    storageLocation: StorageLocation.File,
    defaultServiceUrl: '',
    account: {
        ensName: 'alice.eth',
    },
    provider: {} as any,
};

const keys = {
    encryptionKeyPair: {
        publicKey: 'b',
        privateKey: 'c',
    },
    signingKeyPair: {
        publicKey: 'd',
        privateKey: 'e',
    },
    storageEncryptionNonce: 0,
    storageEncryptionKey: '3',
};

const getProfileData = async (): Promise<{
    address: string;
    signedUserProfile: SignedUserProfile;
    account: Account;
}> => {
    const profile: UserProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug=',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
        deliveryServices: [''],
    };

    const mnemonic =
        'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    const createUserProfileMessage = getProfileCreationMessage(
        stringify(profile),
    );
    const signature = await wallet.signMessage(createUserProfileMessage);

    return {
        address: wallet.address,
        account: {
            ensName: 'bob.eth',
            profile,
            profileSignature: signature,
        },
        signedUserProfile: {
            profile,
            signature,
        },
    };
};

describe('Account', () => {
    describe('getAccountDisplayName', () => {
        test('get correct account display name', async () => {
            expect(getAccountDisplayName('alice.eth')).toStrictEqual(
                'alice.eth',
            );

            expect(getAccountDisplayName('Alice.eth')).toStrictEqual(
                'alice.eth',
            );

            expect(getAccountDisplayName('0x25a6....eth')).toStrictEqual(
                '0x25a6....eth',
            );
        });

        test('get correct account display name for file', async () => {
            expect(
                getAccountDisplayName(
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292.addr.dm3.eth',

                    true,
                ),
            ).toStrictEqual('0x25a6-.eth');
        });

        test('get correct account display name for short account', async () => {
            expect(getAccountDisplayName('alice.eth', true)).toStrictEqual(
                'alice.eth',
            );
        });
    });

    describe('normalizeEnsName', () => {
        test('should normalize an ENS name', async () => {
            expect(normalizeEnsName('Alice.eth')).toStrictEqual('alice.eth');
        });
    });

    describe('checkProfileHash', () => {
        test('should accept a correct hash', async () => {
            const profile: UserProfile = {
                publicSigningKey: '3',
                publicEncryptionKey: '2',
                deliveryServices: [''],
            };

            const wallet = ethers.Wallet.createRandom();
            const signature = await wallet.signMessage(stringify(profile));
            const signedProfile = {
                profile,
                signature,
            };

            const uri =
                'http://test/test?dm3Hash=' +
                sha256(ethers.utils.toUtf8Bytes(stringify(signedProfile)));

            expect(checkProfileHash(signedProfile, uri)).toStrictEqual(true);
        });

        test('should reject an invalid hash', async () => {
            const profile: UserProfile = {
                publicSigningKey: '3',
                publicEncryptionKey: '2',
                deliveryServices: [''],
            };
            const wallet = ethers.Wallet.createRandom();
            const signature = await wallet.signMessage(stringify(profile));
            const signedProfile = {
                profile,
                signature,
            };

            const uri = 'http://test/test?dm3Hash=123456';
            expect(checkProfileHash(signedProfile, uri)).toStrictEqual(false);
        });

        test('should reject an URI without hash', async () => {
            const profile: UserProfile = {
                publicSigningKey: '3',
                publicEncryptionKey: '2',
                deliveryServices: [''],
            };
            const wallet = ethers.Wallet.createRandom();
            const createUserProfileMessage = getProfileCreationMessage(
                stringify(profile),
            );
            const signature = await wallet.signMessage(
                createUserProfileMessage,
            );
            const signedProfile = {
                profile,
                signature,
            };

            const uri = 'http://test/test';
            expect(checkProfileHash(signedProfile, uri)).toStrictEqual(false);
        });
    });

    describe('checkUserProfile', () => {
        test('checkUserProfile should accept a correct signature ', async () => {
            const profile = await getProfileData();

            expect(
                await checkUserProfile(
                    {
                        resolveName: async () => profile.address,
                    } as any,

                    {
                        profile: profile.account.profile!,
                        signature: profile.signedUserProfile.signature,
                    },

                    'alice.eth',
                ),
            ).toStrictEqual(true);
        });

        test('checkUserProfile should reject an invalid signature ', async () => {
            const profile = await getProfileData();

            expect(
                await checkUserProfile(
                    {
                        resolveName: async () => profile.address,
                    } as any,
                    {
                        profile: {
                            ...profile.account.profile!,
                            deliveryServices: ['test.test'],
                        },
                        signature: profile.signedUserProfile.signature,
                    },
                    'alice.eth',
                ),
            ).toStrictEqual(false);
        });
    });

    describe('getBrowserStorageKey', () => {
        test('should return the correct storage key', async () => {
            expect(getBrowserStorageKey('alice.eth')).toStrictEqual(
                'userStorageSnapshot:alice.eth',
            );
        });
    });

    describe('checkStringSignature', () => {
        test('Should accept a valid signature of a string', async () => {
            const wallet = ethers.Wallet.createRandom();
            const sig = await wallet.signMessage('test');

            expect(
                checkStringSignature('test', sig, wallet.address),
            ).toStrictEqual(true);
        });

        test('Should reject an invalid signature of a string', async () => {
            const wallet = ethers.Wallet.createRandom();
            const sig = await wallet.signMessage('test');

            expect(
                checkStringSignature('test1', sig, wallet.address),
            ).toStrictEqual(false);
        });
    });

    describe('checkUserProfile', () => {
        test('Should accept a valid profile signature', async () => {
            const profile = await getProfileData();
            expect(
                await checkUserProfile(
                    {
                        resolveName: async () => profile.address,
                    } as any,
                    profile.signedUserProfile,
                    profile.account.ensName,
                ),
            ).toStrictEqual(true);
        });

        test('Should reject an invalid profile signature', async () => {
            const profile = await getProfileData();
            expect(
                await checkUserProfile(
                    {
                        resolveName: async () => profile.address,
                    } as any,
                    {
                        profile: {
                            ...profile.account.profile!,
                            deliveryServices: ['http://1'],
                        },
                        signature: (
                            await getProfileData()
                        ).signedUserProfile.signature,
                    },

                    (
                        await getProfileData()
                    ).account.ensName,
                ),
            ).toStrictEqual(false);
        });
    });
});
