import { PublicEnvelop } from '../messaging/PublicMessaging';
import { getPublicMessageHead, incomingPublicMessage } from './PublicMessages';
import { Session } from './Session';

const sessions = new Map<string, Session>();
sessions.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', {
    account: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    signedProfileRegistryEntry: {
        profileRegistryEntry: {
            publicKeys: {
                publicMessagingKey:
                    'm2VPbWEpbe6uzwyEaCeez0b1p1fchg9zBL5gFVgHrVk=',

                publicSigningKey:
                    '8E5IihGIfzZUDbLRIzFtOGSX3dqD3QsPNi5uKjmm7d0=',
                publicKey: '',
            },
        },
        signature: '',
    },

    token: '123',
});

test('getPublicMessageHead should return the correct message head ', async () => {
    const messageHeads = new Map<string, string>();

    messageHeads.set(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        'http://123',
    );

    expect(
        getPublicMessageHead(
            messageHeads,
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        ),
    ).toStrictEqual('http://123');
});

test('getPublicMessageHead should return undefined if there is no public message', async () => {
    const messageHeads = new Map<string, string>();

    expect(
        getPublicMessageHead(
            messageHeads,
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        ),
    ).toStrictEqual(undefined);
});

test('Should handle an incoming public message', async () => {
    const messageHeads = new Map<string, string>();
    const publicMessages = new Map<string, PublicEnvelop>();

    const envelop = {
        message: {
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            timestamp: 0,
            message: 'test text',
            previousMessageUri: 'http://123',
        },
        signature:
            '0x3e31b36854a5df1a0f45294cff069eb68396dcc5f0854b74cb5' +
            '1fd53731cd1fdf2ab97da060e38334704f0304fc1eca8c5bc3dd15' +
            '67b275eb4cbb228f8891c05',
    };

    const newState = incomingPublicMessage(
        {
            envelop,
            token: '123',
        },
        sessions,
        messageHeads,
        publicMessages,
    );

    console.log(newState.publicMessages);

    expect(
        newState.messageHeads.get('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855'),
    ).toStrictEqual(
        '0x5cbbd6007b3b9006e307efce60043120d5720ead02a3df9c41dc2c8f4faa7a23',
    );

    expect(
        newState.publicMessages.get(
            '0x5cbbd6007b3b9006e307efce60043120d5720ead02a3df9c41dc2c8f4faa7a23',
        ),
    ).toStrictEqual(envelop);
});

test('Should reject an request with an invalid token', async () => {
    const messageHeads = new Map<string, string>();
    const publicMessages = new Map<string, PublicEnvelop>();

    const envelop = {
        message: {
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            timestamp: 0,
            message: 'test text',
            previousMessageUri: 'http://123',
        },
        signature:
            '0x3e31b36854a5df1a0f45294cff069eb68396dcc5f0854b74cb5' +
            '1fd53731cd1fdf2ab97da060e38334704f0304fc1eca8c5bc3dd15' +
            '67b275eb4cbb228f8891c05',
    };

    expect(() =>
        incomingPublicMessage(
            {
                envelop,
                token: 'abc',
            },
            sessions,
            messageHeads,
            publicMessages,
        ),
    ).toThrow('Token check failed');
});

test('Should reject an request with an invalid signature', async () => {
    const messageHeads = new Map<string, string>();
    const publicMessages = new Map<string, PublicEnvelop>();

    const envelop = {
        message: {
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            timestamp: 0,
            message: 'test text',
            previousMessageUri: 'http://123',
        },
        signature:
            '0x3e31b36854a5df1a0f45294cff069eb68396dcc5f0854b74cb5' +
            '1fd53731cd1fdf2ab97da060e38334704f0304fc1eca8c5bc3dd15' +
            '67b275eb4cbb228f8891c04',
    };

    expect(() =>
        incomingPublicMessage(
            {
                envelop,
                token: '123',
            },
            sessions,
            messageHeads,
            publicMessages,
        ),
    ).toThrow('Signature check failed');
});
