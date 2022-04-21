import {
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from '../storage/Storage';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import { createPublicMessage } from './PublicMessaging';

const connection: Connection = {
    connectionState: ConnectionState.SignedIn,
    storageLocation: StorageLocation.File,
    account: {
        address: '0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27',
    },
};

const userDb: UserDB = {
    conversations: new Map<string, StorageEnvelopContainer[]>(),
    conversationsCount: 0,
    deliveryServiceToken: '',
    keys: {
        publicKey: 'OSD5VDMHaOl/uLSWceXq9pVYhXeLbzcZ7H9ySwpHTlQ=',
        publicMessagingKey: 'xKMMimDOd8Hq61WWz7qaq9Sw9tt+FzMS3uztIpz/pxg=',
        privateMessagingKey: 'OCWOA5JPHAb+0cw1qD3PJPhFpC6y7yXofnKApJHDqZo=',
        publicSigningKey: 'zvmqxxkUAfKGzFrLXqIKrFzopO4ddYVho3xHeqVO8dU=',
        privateSigningKey:
            'OPLrggb2P1a4/qjgv0GW33gQqW41G7G+i1fgbVD1gEvO+arHGRQB8obMWsteogqsXOik7h11hWGjfEd6pU7x1Q==',
        storageEncryptionKey: '3iJShtu+7DooPflK8A8NpytQETPqR5HxQjRZplM4NUg=',
    },
    lastChangeTimestamp: 0,
    syncProcessState: SyncProcessState.Idle,
    synced: true,
};

test('Should create a public message', async () => {
    expect(
        await createPublicMessage(
            'test',
            connection,
            userDb,
            async () => undefined,
            async () => undefined,
            () => 1650568239735,
        ),
    ).toStrictEqual({
        message: {
            from: '0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27',
            timestamp: 1650568239735,
            message: 'test',
            userFeedManifest: { previousMessageUris: [] },
        },
        signature:
            '0x09fca305409010aab58fcf8b8e3f33b66c551f7f689583e42ae34a0c36ca1775' +
            '07e38d8d30d2f512527ec5bfefe3ffba81a658f3c5420402d1c5101d0027c900',
    });
});

test('createMessage should throw if account is undefined', async () => {
    expect.assertions(1);
    await expect(
        createPublicMessage(
            'test text',
            { ...connection, account: undefined },
            userDb,
            async () => undefined,
            async () => undefined,
            () => 0,
        ),
    ).rejects.toEqual(Error('No account'));
});
