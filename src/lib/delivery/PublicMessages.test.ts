import { checkSignature } from '../encryption/Encryption';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { PublicEnvelop } from '../messaging/PublicMessaging';
import { getPublicMessageHead, incomingPublicMessage } from './PublicMessages';
import { Session } from './Session';

const sessions = new Map<string, Session>();
sessions.set(formatAddress('0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27'), {
    account: formatAddress('0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27'),
    signedProfileRegistryEntry: {
        profileRegistryEntry: {
            publicKeys: {
                publicKey: 'OSD5VDMHaOl/uLSWceXq9pVYhXeLbzcZ7H9ySwpHTlQ=',
                publicMessagingKey:
                    'xKMMimDOd8Hq61WWz7qaq9Sw9tt+FzMS3uztIpz/pxg=',

                publicSigningKey:
                    'zvmqxxkUAfKGzFrLXqIKrFzopO4ddYVho3xHeqVO8dU=',
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
            from: '0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27',
            timestamp: 1650568239735,
            message: 'test',
            userFeedManifest: { previousMessageUris: [] },
        },
        signature:
            '0x09fca305409010aab58fcf8b8e3f33b66c551f7f689583e42ae34a0c36ca1775' +
            '07e38d8d30d2f512527ec5bfefe3ffba81a658f3c5420402d1c5101d0027c900',
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

    expect(
        newState.messageHeads.get(
            formatAddress('0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27'),
        ),
    ).toStrictEqual(
        'http://localhost:8080/publicMessage/0x19f9cf72ea6fd81ccd66e42544fed6e7e58d8dfb610ec35906bda29647fa8aa5',
    );

    expect(
        newState.publicMessages.get(
            'http://localhost:8080/publicMessage/0x19f9cf72ea6fd81ccd66e42544fed6e7e58d8dfb610ec35906bda29647fa8aa5',
        ),
    ).toStrictEqual(envelop);
});

test('Should reject an request with an invalid token', async () => {
    const messageHeads = new Map<string, string>();
    const publicMessages = new Map<string, PublicEnvelop>();

    const envelop = {
        message: {
            from: '0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27',
            timestamp: 1650568239735,
            message: 'test',
            userFeedManifest: { previousMessageUris: [] },
        },
        signature:
            '0x09fca305409010aab58fcf8b8e3f33b66c551f7f689583e42ae34a0c36ca1775' +
            '07e38d8d30d2f512527ec5bfefe3ffba81a658f3c5420402d1c5101d0027c900',
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
            from: '0xe5c8b5b8b7e7a43a3c7629f1f06db9c1362d1b27',
            timestamp: 1650568239735,
            message: 'test',
            userFeedManifest: { previousMessageUris: [] },
        },
        signature:
            '0x09fca305409010aab58fcf8b8e3f33b66c551f7f689583e42ae34a0c36ca1775' +
            '07e38d8d30d2f512527ec5bfefe3ffba81a658f3c5420402d1c5101d0027c901',
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
