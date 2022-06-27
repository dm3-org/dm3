import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import {
    createPendingEntry,
    getMessages,
    getPendingConversations,
    incomingMessage,
} from './Messages';

const getSession = async (address: string) => {
    return formatAddress(address) ===
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855'
        ? {
              account: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
              signedProfileRegistryEntry: {
                  profileRegistryEntry: {
                      publicKeys: {
                          publicKey: '',
                          publicMessagingKey: '',
                          publicSigningKey: '',
                      },
                  },
                  signature: '',
              },

              token: '123',
          }
        : null;
};

// test('syncAcknoledgment', async () => {
//     const messages = new Map<string, EncryptionEnvelop[]>();
//     const conversationId = getConversationId(
//         '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//         '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//     );

//     messages.set(conversationId, [
//         {
//             encryptedData: 'a',
//             encryptionVersion: 'x25519-xsalsa20-poly1305',
//             from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//             to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             deliveryServiceIncommingTimestamp: 1,
//         },
//         {
//             encryptedData: 'b',
//             encryptionVersion: 'x25519-xsalsa20-poly1305',
//             to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//             from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             deliveryServiceIncommingTimestamp: 1,
//         },
//         {
//             encryptedData: 'c',
//             encryptionVersion: 'x25519-xsalsa20-poly1305',
//             from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//             to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             deliveryServiceIncommingTimestamp: 3,
//         },
//     ]);

//     const newMessages = await handleSyncAcknoledgment(
//         '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//         [
//             {
//                 contactAddress: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//                 messageDeliveryServiceTimestamp: 2,
//             },
//         ],
//         '123',
//         getSession,
//         messages,
//     );

//     expect(newMessages.get(conversationId)).toStrictEqual([
//         {
//             encryptedData: 'b',
//             encryptionVersion: 'x25519-xsalsa20-poly1305',
//             to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//             from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             deliveryServiceIncommingTimestamp: 1,
//         },
//         {
//             encryptedData: 'c',
//             encryptionVersion: 'x25519-xsalsa20-poly1305',
//             from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
//             to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             deliveryServiceIncommingTimestamp: 3,
//         },
//     ]);
// });

// test('syncAcknoledgment auth', async () => {
//     const messages = new Map<string, EncryptionEnvelop[]>();
//     expect.assertions(1);

//     await expect(() =>
//         handleSyncAcknoledgment(
//             '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
//             [],
//             'abc',
//             getSession,
//             messages,
//         ),
//     ).rejects.toEqual(Error('Token check failed'));
// });

test('getPendingConversations', async () => {
    const pendingConversations = new Map<string, Set<string>>();
    pendingConversations.set(
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        new Set<string>(['0x25A643B6e52864d0eD816F1E43c0CF49C83B8292']),
    );
    const response = await getPendingConversations(
        pendingConversations,
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
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

    expect.assertions(1);

    await expect(() =>
        createPendingEntry(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            'abc',
            getSession,
            pendingConversations,
        ),
    ).rejects.toEqual(Error('Token check failed'));
});

test('createPendingEntry', async () => {
    const pendingConversations = new Map<string, Set<string>>();
    const newPendingConversations = await createPendingEntry(
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '123',
        getSession,
        pendingConversations,
    );

    expect(
        newPendingConversations
            .get('0x25A643B6e52864d0eD816F1E43c0CF49C83B8292')
            ?.has('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855'),
    ).toStrictEqual(true);
});

test('incomingMessage auth', async () => {
    const storeNewMessage = async (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => {};

    expect.assertions(1);

    await expect(() =>
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

            getSession,
            storeNewMessage,
            () => {},
        ),
    ).rejects.toEqual(Error('Token check failed'));
});

test('incomingMessage', async () => {
    let messageContainer: {
        conversationId?: string;
        envelop?: EncryptionEnvelop;
    } = {};
    const storeNewMessage = async (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => {
        messageContainer = { conversationId, envelop };
    };

    await incomingMessage(
        {
            envelop: {
                encryptedData: '',
                encryptionVersion: 'x25519-xsalsa20-poly1305',
                to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            },
            token: '123',
        },
        getSession,
        storeNewMessage,
        () => {},
    );

    const conversationId = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    delete messageContainer.envelop?.deliveryServiceIncommingTimestamp;

    expect(messageContainer).toStrictEqual({
        conversationId,
        envelop: {
            encryptedData: '',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    });
});

test('getMessages', async () => {
    const messages = new Map<string, EncryptionEnvelop[]>();
    const conversationIdToUse = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    const loadMessages = async (
        conversationId: string,
        offset: number,
        size: number,
    ) => {
        return conversationId === conversationIdToUse
            ? ([
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
              ] as EncryptionEnvelop[])
            : [];
    };

    expect(
        await getMessages(
            loadMessages,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        ),
    ).toStrictEqual([
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
    ]);
});
