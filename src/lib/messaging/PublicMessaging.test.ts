import {
    StorageEnvelopContainer,
    StorageLocation,
    SyncProcessState,
    UserDB,
} from '../storage/Storage';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';
import { createMessage } from './PublicMessaging';

const connection: Connection = {
    connectionState: ConnectionState.SignedIn,
    storageLocation: StorageLocation.File,
    account: {
        address: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    },
};

const userDb: UserDB = {
    conversations: new Map<string, StorageEnvelopContainer[]>(),
    conversationsCount: 0,
    deliveryServiceToken: '',
    keys: {
        publicMessagingKey: 'm2VPbWEpbe6uzwyEaCeez0b1p1fchg9zBL5gFVgHrVk=',
        privateMessagingKey: 'jyWKuUgG7+3nQw/f69iKJaIIm8WHT+cf1ZKmESISYk4=',
        publicSigningKey: '8E5IihGIfzZUDbLRIzFtOGSX3dqD3QsPNi5uKjmm7d0=',
        privateSigningKey:
            'L/QNgb9rpAShmT+feiI8tDhzR+0L1n4b+1XyvmQ9mUPwTkiKEYh/NlQNstEjMW04ZJfd2oPdCw82Lm4qOabt3Q==',

        publicKey: '',

        storageEncryptionKey: '',
    },
    lastChangeTimestamp: 0,
    syncProcessState: SyncProcessState.Idle,
    synced: true,
};

test('Should create a public message', async () => {
    expect(
        await createMessage(
            'test text',
            connection,
            userDb,
            async () => 'http://123',
            () => 0,
        ),
    ).toStrictEqual({
        message: {
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            timestamp: 0,
            message: 'test text',
            previousMessageUri: 'http://123',
        },
        signature:
            '0x3e31b36854a5df1a0f45294cff069eb68396dcc5f0854b74cb5' +
            '1fd53731cd1fdf2ab97da060e38334704f0304fc1eca8c5bc3dd1567b275eb4cbb228f8891c05',
    });
});

test('createMessage should throw if account is undefined', async () => {
    expect.assertions(1);
    await expect(
        createMessage(
            'test text',
            { ...connection, account: undefined },
            userDb,
            async () => 'http://123',
            () => 0,
        ),
    ).rejects.toEqual(Error('No account'));
});
