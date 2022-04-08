import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import {
    createPendingEntry,
    getMessages,
    getPendingConversations,
    handleSyncAcknoledgment,
    incomingMessage,
} from './Messages';
import { Session } from './Session';

const sessions = new Map<string, Session>();
sessions.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', {
    account: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    profileRegistryEntry: {
        publicKeys: {
            publicKey: '',
            publicMessagingKey: '',
            publicSigningKey: '',
        },
    },
    profileRegistryEntrySignature: '',
    token: '123',
});

test('syncAcknoledgment', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();
    const conversationId = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    messages.set(conversationId, [
        {
            encryptedData: 'a',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 1,
        },
        {
            encryptedData: 'b',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 1,
        },
        {
            encryptedData: 'c',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 3,
        },
    ]);

    const newMessages = handleSyncAcknoledgment(
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        [
            {
                contactAddress: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                messageDeliveryServiceTimestamp: 2,
            },
        ],
        '123',
        sessions,
        messages,
    );

    expect(newMessages.get(conversationId)).toStrictEqual([
        {
            encryptedData: 'b',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 1,
        },
        {
            encryptedData: 'c',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 3,
        },
    ]);
});

test('syncAcknoledgment auth', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();

    expect(() =>
        handleSyncAcknoledgment(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            [],
            'abc',
            sessions,
            messages,
        ),
    ).toThrow('Token check failed');
});

test('getPendingConversations auth', async () => {
    const pendingConversations = new Map<string, Set<string>>();

    expect(() =>
        getPendingConversations(
            sessions,
            pendingConversations,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            'abc',
        ),
    ).toThrow('Token check failed');
});

test('getPendingConversations', async () => {
    const pendingConversations = new Map<string, Set<string>>();
    pendingConversations.set(
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        new Set<string>(['0x25A643B6e52864d0eD816F1E43c0CF49C83B8292']),
    );
    const response = getPendingConversations(
        sessions,
        pendingConversations,
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        '123',
    );

    expect(
        Array.from(
            response.pendingConversations
                .get('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855')!
                .keys(),
        ).length,
    ).toStrictEqual(0);

    expect(response.pendingConversationsForAccount).toStrictEqual([
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
    ]);
});

test('createPendingEntry auth', async () => {
    const pendingConversations = new Map<string, Set<string>>();

    expect(() =>
        createPendingEntry(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            'abc',
            sessions,
            pendingConversations,
        ),
    ).toThrow('Token check failed');
});

test('createPendingEntry', async () => {
    const pendingConversations = new Map<string, Set<string>>();
    const newPendingConversations = createPendingEntry(
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '123',
        sessions,
        pendingConversations,
    );

    expect(
        newPendingConversations
            .get('0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
            ?.has('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855'),
    ).toStrictEqual(true);
});

test('incomingMessage auth', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();

    expect(() =>
        incomingMessage(
            {
                envelop: {
                    encryptedData: '',
                    encryptionVersion: 'x25519-xsalsa20-poly1305',
                    to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                    from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                },
                token: 'abc',
            },
            sessions,
            messages,
            () => {},
        ),
    ).toThrow('Token check failed');
});

test('incomingMessage', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();
    const newMessages = incomingMessage(
        {
            envelop: {
                encryptedData: '',
                encryptionVersion: 'x25519-xsalsa20-poly1305',
                to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            },
            token: '123',
        },
        sessions,
        messages,
        () => {},
    );

    const conversation = newMessages.get(
        getConversationId(
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        ),
    ) as EncryptionEnvelop[];

    expect(conversation[0]).toHaveProperty('deliveryServiceIncommingTimestamp');

    delete conversation[0].deliveryServiceIncommingTimestamp;
    expect(conversation).toStrictEqual([
        {
            encryptedData: '',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    ]);
});

test('getMessages auth', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();

    expect(() =>
        getMessages(
            sessions,
            messages,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            'abc',
        ),
    ).toThrow('Token check failed');
});

test('getMessages', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();
    const conversationId = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    messages.set(conversationId, [
        {
            encryptedData: 'a',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 1,
        },
        {
            encryptedData: 'b',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 1,
        },
        {
            encryptedData: 'c',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            deliveryServiceIncommingTimestamp: 3,
        },
    ]);

    expect(
        getMessages(
            sessions,
            messages,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            '123',
        ),
    ).toStrictEqual({
        messages: [
            {
                encryptedData: 'a',
                encryptionVersion: 'x25519-xsalsa20-poly1305',
                from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                deliveryServiceIncommingTimestamp: 1,
            },
            {
                encryptedData: 'c',
                encryptionVersion: 'x25519-xsalsa20-poly1305',
                from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                deliveryServiceIncommingTimestamp: 3,
            },
        ],
    });
});
