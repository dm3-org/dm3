import { ethers, providers } from 'ethers';
import { stringify } from '../shared/stringify';
import { sha256 } from 'ethers/lib/utils';

import {
    getConversationId,
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from '../storage/Storage';

import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import {
    Account,
    addContact,
    checkProfileHash,
    checkStringSignature,
    checkUserProfile,
    getAccountDisplayName,
    getBrowserStorageKey,
    getContacts,
    getUserProfile,
    UserProfile,
    SignedUserProfile,
    getProfileCreationMessage,
    normalizeEnsName,
    PROFILE_RECORD_NAME,
    getPublishProfileOnchainTransaction,
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

    describe('getContacts', () => {
        test('should get contacts ', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                hiddenContacts: [],
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set('alice.eth,bob.eth', []);

            expect(
                await getContacts(
                    {
                        ...connection,
                        provider: { resolveName: async () => '' } as any,
                    },
                    '',
                    async () => undefined,
                    async () => [],
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    ensName: 'bob.eth',
                    profile: undefined,
                },
            ]);
        });

        test('should get contacts with reverse conversation id order', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                hiddenContacts: [],
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set('alice.eth,bob.eth', []);

            expect(
                await getContacts(
                    {
                        ...connection,
                        account: {
                            ensName: 'bob.eth',
                        },
                    },
                    '',
                    async () => undefined,
                    async () => [],
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    ensName: 'alice.eth',
                    profile: undefined,
                },
            ]);
        });

        test('should get contacts with profile', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                hiddenContacts: [],
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };
            const profile = await getProfileData();

            userDb.conversations.set(
                getConversationId(profile.account.ensName, 'bob.eth'),
                [],
            );

            expect(
                await getContacts(
                    {
                        ...connection,
                        provider: {
                            resolveName: async () => profile.address,
                        } as any,
                    },
                    '',
                    async () => profile.signedUserProfile,
                    async () => [],
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    ensName: profile.account.ensName,
                    profile: profile.signedUserProfile.profile,
                },
            ]);
        });

        test('should get contacts and not add a contact for an existing conversation', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                hiddenContacts: [],
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set('alice.eth,' + 'bob.eth', []);

            const conversations: string[] = [];

            await getContacts(
                connection,
                '',
                async () => undefined,
                async () => ['bob.eth'],
                userDb,
                (id) => {
                    conversations.push(id);
                },
            );
            expect(Array.from(userDb.conversations.keys())).toStrictEqual([
                'alice.eth,bob.eth',
            ]);
        });

        test('should add a new contact ', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                hiddenContacts: [],
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            const conversations: string[] = [];

            await getContacts(
                connection,
                '',
                async () => undefined,
                async () => ['bob.eth'],
                userDb,
                (id) => {
                    conversations.push(id);
                },
            );
            expect(conversations).toStrictEqual(['alice.eth,bob.eth']);
        });

        test('should throw if provider is undefined', async () => {
            expect.assertions(1);
            await expect(
                getContacts(
                    { ...connection, provider: undefined },
                    '',
                    async () => undefined,
                    async () => [],
                    {} as any,
                    () => {},
                ),
            ).rejects.toEqual(Error('No provider'));
        });
    });

    describe('addContact', () => {
        test('Should create an empty conversation for a new contact ', (done) => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                hiddenContacts: [],
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            addContact(connection, 'bob.eth', userDb, (id: string) => {
                expect(id).toStrictEqual('alice.eth,bob.eth');
                done();
                return true;
            });
        });

        test('Should create an empty conversation for a new contact  after resolving the ENS name', (done) => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                hiddenContacts: [],
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            addContact(
                connection,
                'test.eth',

                userDb,
                (id: string) => {
                    expect(id).toStrictEqual('alice.eth,test.eth');
                    done();
                },
            );
        });

        test('Should reject to add a contact if the contact was already added', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                hiddenContacts: [],
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set('alice.eth,bob.eth', []);
            userDb.conversationsCount = 1;

            expect.assertions(1);
            await expect(
                addContact(connection, 'bob.eth', userDb, () => false),
            ).rejects.toEqual(Error('Contact exists already.'));
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

    describe('getUserProfile', () => {
        test('Should get profile registry entry from chain if text record is url', async () => {
            const profile: UserProfile = {
                publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };
            const signedUserProfile = {
                profile,
                //TODO Maybe create new signature
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            };

            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => undefined,
                    async () =>
                        'data:application/json,' + stringify(signedUserProfile),
                    async (uri) => signedUserProfile,
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });

        test('Should return undefined if no resolver could be found', async () => {
            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => ({ test: 'test' } as any),
                    async () => 'test',

                    async () => undefined,
                ),
            ).resolves.toStrictEqual(undefined);
        });

        test('Should get profile registry entry from IPFS if textRecord is ipfs hash', async () => {
            const profile: UserProfile = {
                publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };
            const signedUserProfile = {
                profile,
                //TODO Maybe create new signature
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            };

            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => undefined,
                    async () =>
                        'ipfs://QmZwrAZFDprTo2h3Gbdc4hS2vEVSP1q9j7vDTq8TS1Z137',
                    async (uri) => {
                        return uri ===
                            // eslint-disable-next-line max-len
                            'https://www.ipfs.io/ipfs/QmZwrAZFDprTo2h3Gbdc4hS2vEVSP1q9j7vDTq8TS1Z137'
                            ? signedUserProfile
                            : undefined;
                    },
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });

        test('Should resolve profile if textRecored stores a stringified profile ', async () => {
            const profile: UserProfile = {
                publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };
            const signedUserProfile = {
                profile,
                //TODO Maybe create new signature
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            };

            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => undefined,
                    async () =>
                        'data:application/json,' +
                        JSON.stringify(signedUserProfile),
                    async (_) => undefined,
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });

        test('Should get profile registry entry from backend', async () => {
            const profile: UserProfile = {
                publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };
            const signedUserProfile = {
                profile,
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            };

            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => signedUserProfile,
                    async () => undefined,

                    async () => undefined,
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });

        test('Should prioritize onchain over offchain ', async () => {
            const profile: UserProfile = {
                publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
                publicEncryptionKey:
                    'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
                deliveryServices: [''],
            };
            const signedUserProfile = {
                profile,
                signature:
                    '0xaa927647cf7c73363d9c157f113f1c1754307aae79d886dc4cfa7bcb77b4dfc1' +
                    '6cb50e808708085009ee782046891d8b85966a1a7482c5c0c42f73c7210cf7da1b',
            };

            const signedUserProfile2 = {
                ...signedUserProfile,
                signature: '1',
            };

            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    'bob.eth',
                    async () => signedUserProfile2,
                    async () =>
                        'data:application/json,' +
                        JSON.stringify(signedUserProfile),
                    async (uri) => {
                        return signedUserProfile;
                    },
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });
    });

    describe('publishProfileOnchain', () => {
        test('Should publish a profile on chain', async () => {
            expect.assertions(2);
            const profile = await getProfileData();
            const tx = await getPublishProfileOnchainTransaction(
                {
                    ...connection,
                    provider: {
                        resolveName: async () => profile.address,
                    } as any,
                    account: profile.account,
                },
                'alice.eth',
                () => ({ address: '0x2' } as any),
                () => ({ setText: () => 'success' } as any),
            );

            expect(tx?.args).toStrictEqual([
                '0x787192fc5378cc32aa956ddfdedbf26b24e8d78e40109add0eea2c1a012c3dec',
                PROFILE_RECORD_NAME,
                'data:application/json,' +
                    stringify({ ...profile.signedUserProfile }),
            ]);

            expect(tx?.method()).toStrictEqual('success');
        });

        test('Should throw if a provider is missing', async () => {
            expect.assertions(1);

            await expect(
                getPublishProfileOnchainTransaction(
                    { ...connection, provider: undefined },
                    '',
                    () => ({ address: '0x2' } as any),
                    () => ({ setText: () => 'success' } as any),
                ),
            ).rejects.toEqual(Error('No provider'));
        });

        test('Should throw if a account is missing', async () => {
            expect.assertions(1);

            await expect(
                getPublishProfileOnchainTransaction(
                    { ...connection, account: undefined },
                    '',
                    () => ({ address: '0x2' } as any),
                    () => ({ setText: () => 'success' } as any),
                ),
            ).rejects.toEqual(Error('No account'));
        });

        test('Should throw if profile could not be loaded', async () => {
            expect.assertions(1);

            await expect(
                getPublishProfileOnchainTransaction(
                    { ...connection },
                    '',

                    () => ({ address: '0x2' } as any),
                    () => ({ setText: () => 'success' } as any),
                ),
            ).rejects.toEqual(Error('No profile'));
        });

        test('Should throw if the ENS could not be obtained ', async () => {
            expect.assertions(1);
            const profile = await getProfileData();

            await expect(
                getPublishProfileOnchainTransaction(
                    { ...connection, account: profile.account },
                    '',
                    () => null as any,
                    () => ({ setText: () => 'success' } as any),
                ),
            ).rejects.toEqual(Error('No resolver found'));
        });
    });
});
