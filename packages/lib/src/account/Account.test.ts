import { ethers } from 'ethers';
import stringify from 'safe-stable-stringify';

import {
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

    const signature = await wallet.signMessage(stringify(profile));

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

test('get correct account display name if account is undefined', async () => {
    const ensNames = new Map();
    ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
    expect(getAccountDisplayName(undefined, ensNames)).toStrictEqual('');
});

test('createHashUrlParam should create the correct hash', async () => {
    expect(
        createHashUrlParam((await getProfileData()).signedUserProfile),
    ).toStrictEqual(
        'dm3Hash=0x7c1761796e12dff0e1b5bfc9aaa1c4e8bb7b759cd5ec4c52e0b0ddadb401d071',
    );
});

test('checkProfileHash should accept a correct hash ', async () => {
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
        ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(stringify(signedProfile)),
        );

    expect(checkProfileHash(signedProfile, uri)).toStrictEqual(true);
});

test('checkProfileHash should reject  an invalid hash ', async () => {
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

test('checkProfileHash should reject an URI without hash', async () => {
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

    const uri = 'http://test/test';
    expect(checkProfileHash(signedProfile, uri)).toStrictEqual(false);
});

test('checkUserProfile should accept a correct signature ', async () => {
    const profile: UserProfile = {
        publicSigningKey: '3',
        publicEncryptionKey: '2',
        deliveryServices: [''],
    };

    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(stringify(profile));

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
        checkUserProfile({ profile: profile, signature }, wallet.address),
    ).toStrictEqual(false);
});

test('getContacts ', async () => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
            storageEncryptionKeySalt: 'salt',
        },
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

test('getContacts should throw if provider is undefined', async () => {
    expect.assertions(1);
    await expect(
        getContacts(
            { ...connection, provider: undefined },
            async () => undefined,
            async () => [],
            async () => '',
            {} as any,
            () => {},
        ),
    ).rejects.toEqual(Error('No provider'));
});

test('Should create an empty conversation for a new contact ', (done) => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
            storageEncryptionKeySalt: 'salt',
        },
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
        },
    );
});

test('Should reject to add a contact if the contact was already added', async () => {
    const userDb: UserDB = {
        conversations: new Map<string, StorageEnvelopContainer[]>(),
        conversationsCount: 0,
        deliveryServiceToken: '',
        keys: {
            publicMessagingKey: 'b',
            publicSigningKey: 'c',
            privateMessagingKey: '1',
            privateSigningKey: '2',
            storageEncryptionKey: '3',
            storageEncryptionKeySalt: 'salt',
        },
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

test('getBrowserStorageKey', async () => {
    expect(
        getBrowserStorageKey('0x25A643B6e52864d0eD816F1E43c0CF49C83B8292'),
    ).toStrictEqual(
        'userStorageSnapshot0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
    );
});

test('Should accept a valid signature of a string', async () => {
    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage('test');

    expect(checkStringSignature('test', sig, wallet.address)).toStrictEqual(
        true,
    );
});

test('Should reject an invalid signature of a string', async () => {
    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage('test');

    expect(checkStringSignature('test1', sig, wallet.address)).toStrictEqual(
        false,
    );
});

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
                signature: (await getProfileData()).signedUserProfile.signature,
            },
            (await getProfileData()).account.address,
        ),
    ).toStrictEqual(false);
});

test('Should get profile registry entry from chain', async () => {
    const profile: UserProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
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
            async () => 'http://123?' + createHashUrlParam(signedUserProfile),

            async (uri) =>
                uri === 'http://123?' + createHashUrlParam(signedUserProfile)
                    ? signedUserProfile
                    : undefined,
        ),
    ).resolves.toStrictEqual(signedUserProfile);
});

test('Should get profile registry entry from backend', async () => {
    const profile: UserProfile = {
        publicSigningKey: '0ekgI3CBw2iXNXudRdBQHiOaMpG9bvq9Jse26dButug',
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
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
        publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
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
            async () => 'http://123?' + createHashUrlParam(signedUserProfile),

            async (uri) =>
                uri === 'http://123?' + createHashUrlParam(signedUserProfile)
                    ? signedUserProfile
                    : undefined,
        ),
    ).resolves.toStrictEqual(signedUserProfile);
});

test('publishProfileOnchain', async () => {
    // expect.assertions(2);
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

    console.log(tx?.args);

    expect(tx?.args).toStrictEqual([
        '0xca7a0eadca1ba3745db7065063294b717422bd1c70995cba8f5adcd094fdae1d',
        'eth.dm3.profile',
        'http://bla?dm3Hash=0x7c1761796e12dff0e1b5bfc9aaa1c4e8bb7b759cd5ec4c52e0b0ddadb401d071',
    ]);

    expect(tx?.method()).toStrictEqual('success');
});

test('publishProfileOnchain should throw', async () => {
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
