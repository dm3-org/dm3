import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { handleSyncAcknoledgment } from './Messages';
import { Session } from './Session';

test('syncAcknoledgment', async () => {
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
