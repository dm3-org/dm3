import { ethers } from 'ethers';
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
    createHashUrlParam,
    getAccountDisplayName,
    getBrowserStorageKey,
    getContacts,
    getUserProfile,
    UserProfile,
    publishProfileOnchain,
    SignedUserProfile,
    getProfileCreationMessage,
} from './Account';

const connection: Connection = {
    connectionState: ConnectionState.SignedIn,
    storageLocation: StorageLocation.File,
    defaultServiceUrl: '',
    account: {
        address: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
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
        account: {
            address: wallet.address,
            profile,
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
            const ensNames = new Map();
            ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
            expect(
                getAccountDisplayName(
                    '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    ensNames,
                ),
            ).toStrictEqual('test1');

            expect(
                getAccountDisplayName(
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    ensNames,
                ),
            ).toStrictEqual('0x25...8292');
        });

        test('get correct account display name for file', async () => {
            const ensNames = new Map();

            expect(
                getAccountDisplayName(
                    '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    ensNames,
                    true,
                ),
            ).toStrictEqual('0xDd-7855');
        });

        test('get correct account display name for short account', async () => {
            const ensNames = new Map();

            expect(
                getAccountDisplayName('0xDd55', ensNames, true),
            ).toStrictEqual('0xDd55');
        });

        test('get correct account display name if account is undefined', async () => {
            const ensNames = new Map();
            ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
            expect(getAccountDisplayName(undefined, ensNames)).toStrictEqual(
                '',
            );
        });
    });

    describe('createHashUrlParam', () => {
        test('should create the correct hash', async () => {
            expect(
                createHashUrlParam((await getProfileData()).signedUserProfile),
            ).toStrictEqual(
                'dm3Hash=0x352942c3b35370f5424b2a4d263aeca1158a5c6e3c1d0a866c23f9d80e6ea426',
            );
        });
    });

    describe('checkProfileHash', () => {
        test('should accept a correct hash ', async () => {
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

        test('should reject  an invalid hash ', async () => {
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

            expect(
                checkUserProfile(
                    {
                        profile: profile,
                        signature,
                    },
                    wallet.address,
                ),
            ).toStrictEqual(true);
        });

        test('checkUserProfile should reject an invalid signature ', async () => {
            const profile: UserProfile = {
                publicSigningKey: '3',
                publicEncryptionKey: '2',
                deliveryServices: [''],
            };

            const wallet = ethers.Wallet.createRandom();

            const signature = await wallet.signMessage(
                stringify(profile.publicEncryptionKey),
            );

            expect(
                checkUserProfile(
                    { profile: profile, signature },
                    wallet.address,
                ),
            ).toStrictEqual(false);
        });
    });

    describe('getContacts', () => {
        test('should get contacts ', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                [],
            );

            expect(
                await getContacts(
                    connection,
                    '',
                    async () => undefined,
                    async () => [],
                    async () => '',
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    address: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    profile: undefined,
                },
            ]);
        });

        test('should get contacts with reverse conversation id order', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                [],
            );

            expect(
                await getContacts(
                    {
                        ...connection,
                        account: {
                            address:
                                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                        },
                    },
                    '',
                    async () => undefined,
                    async () => [],
                    async () => '',
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    address: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    profile: undefined,
                },
            ]);
        });

        test('should get contacts with profile', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };
            const profile = await getProfileData();

            userDb.conversations.set(
                getConversationId(
                    profile.account.address,
                    '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                ),
                [],
            );

            expect(
                await getContacts(
                    connection,
                    '',
                    async () => profile.signedUserProfile,
                    async () => [],
                    async () => '',
                    userDb,
                    () => {},
                ),
            ).toStrictEqual([
                {
                    address: profile.account.address,
                    profile: profile.signedUserProfile.profile,
                },
            ]);
        });

        test('should get contacts and not add a contact for an existing conversation', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,' +
                    '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                [],
            );

            const conversations: string[] = [];

            await getContacts(
                connection,
                '',
                async () => undefined,
                async () => ['0x25A643B6e52864d0eD816F1E43c0CF49C83B8292'],
                async () => '',
                userDb,
                (id) => {
                    conversations.push(id);
                },
            );
            expect(Array.from(userDb.conversations.keys())).toStrictEqual([
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            ]);
        });

        test('should add a new contact ', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            const conversations: string[] = [];

            await getContacts(
                connection,
                '',
                async () => undefined,
                async () => ['0x25A643B6e52864d0eD816F1E43c0CF49C83B8292'],
                async () => '',
                userDb,
                (id) => {
                    conversations.push(id);
                },
            );
            expect(conversations).toStrictEqual([
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            ]);
        });

        test('should throw if provider is undefined', async () => {
            expect.assertions(1);
            await expect(
                getContacts(
                    { ...connection, provider: undefined },
                    '',
                    async () => undefined,
                    async () => [],
                    async () => '',
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
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            addContact(
                connection,
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                async () => null,
                userDb,
                (id: string) => {
                    expect(id).toStrictEqual(
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    );
                    done();
                    return true;
                },
            );
        });

        test('Should create an empty conversation for a new contact  after resolving the ENS name', (done) => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            addContact(
                connection,
                'test.eth',
                async () => '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                userDb,
                (id: string) => {
                    expect(id).toStrictEqual(
                        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                    );
                    done();
                },
            );
        });

        test('Should throw if name could not be resolved', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            await expect(
                addContact(
                    connection,
                    'test.eth',
                    async () => null,
                    userDb,
                    (id: string) => {
                        expect(id).toStrictEqual(
                            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                        );
                    },
                ),
            ).rejects.toEqual(Error(`Couldn't resolve name`));
        });

        test('Should reject to add a contact if the contact was already added', async () => {
            const userDb: UserDB = {
                conversations: new Map<string, StorageEnvelopContainer[]>(),
                conversationsCount: 0,
                keys,
                lastChangeTimestamp: 0,
                syncProcessState: SyncProcessState.Idle,
                synced: true,
            };

            userDb.conversations.set(
                '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292,0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                [],
            );
            userDb.conversationsCount = 1;

            expect.assertions(1);
            await expect(
                addContact(
                    connection,
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    async () => null,
                    userDb,
                    () => false,
                ),
            ).rejects.toEqual(Error('Contact exists already.'));
        });
    });

    describe('getBrowserStorageKey', () => {
        test('should return the correct storage key', async () => {
            expect(
                getBrowserStorageKey(
                    '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                ),
            ).toStrictEqual(
                'userStorageSnapshot0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            );
        });
        test('should return the correct storage key', async () => {
            expect(() => getBrowserStorageKey(null as any)).toThrowError(
                'No address provided',
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
            expect(
                checkUserProfile(
                    (await getProfileData()).signedUserProfile,
                    (await getProfileData()).account.address,
                ),
            ).toStrictEqual(true);
        });

        test('Should reject an invalid profile signature', async () => {
            const userProfile = (await getProfileData()).account.profile!;
            expect(
                checkUserProfile(
                    {
                        profile: {
                            ...userProfile,
                            deliveryServices: ['http://1'],
                        },
                        signature: (await getProfileData()).signedUserProfile
                            .signature,
                    },
                    (await getProfileData()).account.address,
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
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
                    async () => undefined,
                    async () =>
                        'http://123?' + createHashUrlParam(signedUserProfile),

                    async (uri) =>
                        uri ===
                        'http://123?' + createHashUrlParam(signedUserProfile)
                            ? signedUserProfile
                            : undefined,
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });

        test('Should return undefined if no resolver could be found', async () => {
            expect.assertions(1);
            await expect(
                getUserProfile(
                    { provider: {} } as any,
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
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
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
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
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
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
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
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
                    '0x8101b0729eb9708a344c820fce80f12a90a7c1fa',
                    async () => signedUserProfile2,
                    async () =>
                        'http://123?' + createHashUrlParam(signedUserProfile),

                    async (uri) =>
                        uri ===
                        'http://123?' + createHashUrlParam(signedUserProfile)
                            ? signedUserProfile
                            : undefined,
                ),
            ).resolves.toStrictEqual(signedUserProfile);
        });
    });

    describe('publishProfileOnchain', () => {
        test('Should publish a profile on chain', async () => {
            expect.assertions(2);
            const profile = await getProfileData();
            const tx = await publishProfileOnchain(
                {
                    ...connection,
                    account: profile.account,
                },
                'http://bla',
                async () => '0x1',
                () => {
                    return { address: '0x2' } as any;
                },
                () => {
                    return { setText: () => 'success' } as any;
                },
                async () => {
                    return profile.signedUserProfile;
                },
            );

            expect(tx?.args).toStrictEqual([
                '0xca7a0eadca1ba3745db7065063294b717422bd1c70995cba8f5adcd094fdae1d',
                'eth.dm3.profile',
                'http://bla?dm3Hash=0x352942c3b35370f5424b2a4d263aeca1158a5c6e3c1d0a866c23f9d80e6ea426',
            ]);

            expect(tx?.method()).toStrictEqual('success');
        });

        test('Should throw if a provider is missing', async () => {
            expect.assertions(1);

            await expect(
                publishProfileOnchain(
                    { ...connection, provider: undefined },
                    'http://bla',
                    async () => '0x1',
                    () => {
                        return { address: '0x2' } as any;
                    },
                    () => {
                        return { setText: () => 'success' } as any;
                    },
                    async () => {
                        return undefined;
                    },
                ),
            ).rejects.toEqual(Error('No provider'));
        });

        test('Should throw if a account is missing', async () => {
            expect.assertions(1);

            await expect(
                publishProfileOnchain(
                    { ...connection, account: undefined },
                    'http://bla',
                    async () => '0x1',
                    () => {
                        return { address: '0x2' } as any;
                    },
                    () => {
                        return { setText: () => 'success' } as any;
                    },
                    async () => {
                        return undefined;
                    },
                ),
            ).rejects.toEqual(Error('No account'));
        });

        test('Should throw if profile could not be loaded', async () => {
            expect.assertions(1);

            await expect(
                publishProfileOnchain(
                    { ...connection },
                    'http://bla',
                    async () => '0x1',
                    () => ({ address: '0x2' } as any),
                    () => ({ setText: () => 'success' } as any),
                    async () => undefined,
                ),
            ).rejects.toEqual(Error('could not load account profile'));
        });

        test('Should throw if profile check failed', async () => {
            expect.assertions(1);
            const profile = await getProfileData();

            await expect(
                publishProfileOnchain(
                    {
                        ...connection,
                        account: profile.account,
                    },
                    'http://bla',
                    async () => '0x1',
                    () => ({ address: '0x2' } as any),
                    () => ({ setText: () => 'success' } as any),
                    async () => ({
                        ...profile.signedUserProfile,
                        signature:
                            '0x58df6ddfc3707ef8483537fe82fc29da9eefa87329d2a71823d791659c6a6bb' +
                            '04a49da60521101660cc9c32d6fff44e0fb9dfac9fad8b697b0c5601ae9e09d101c',
                    }),
                ),
            ).rejects.toEqual(Error('account profile check failed'));
        });

        test('Should throw if ENS name could not be found', async () => {
            expect.assertions(1);

            await expect(
                publishProfileOnchain(
                    { ...connection },
                    'http://bla',
                    async () => null,
                    () => {
                        return { address: '0x2' } as any;
                    },
                    () => {
                        return { setText: () => 'success' } as any;
                    },
                    async () => {
                        return undefined;
                    },
                ),
            ).rejects.toEqual(Error('No ENS name found'));
        });

        test('Should throw if the ENS could not be obtained ', async () => {
            expect.assertions(1);

            await expect(
                publishProfileOnchain(
                    { ...connection },
                    'http://bla',
                    async () => '0x1',
                    async () => {
                        return null;
                    },
                    () => {
                        return { setText: () => 'success' } as any;
                    },
                    async () => {
                        return undefined;
                    },
                ),
            ).rejects.toEqual(Error('No resolver found'));
        });
    });
});
