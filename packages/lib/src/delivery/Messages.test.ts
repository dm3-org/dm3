import { UserProfile } from '../account/Account';
import { decryptAsymmetric } from '../crypto';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { getMessages, incomingMessage } from './Messages';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keysA = {
    encryptionKeyPair: {
        publicKey:
            '0x78798cab6f457a23ca7cd3e449cb4fb99197bd5d2c29e3bf299917da75ef320c',
        privateKey:
            '0xa4c23bec5db0dc62bea2664207803ad560ea21238e9d61974767ff3132dba9b6',
    },
    signingKeyPair: {
        publicKey:
            '0xfad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895' +
            'fad90341665fbfd8b106639bb1ff2d8131d365a8f0004f66b93b450148f67bd2',
    },
    storageEncryptionKey:
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb895',
    storageEncryptionNonce: 0,
};

const keysB = {
    encryptionKeyPair: {
        publicKey:
            '0x19867565066fc86c876f6f027006f64edabe435155fffa5269746eac00142608',
        privateKey:
            '0x395643aa80723066c4ce1c5d1dc4eeaf3a44c31c4fdbfd44322354c7e493e60e',
    },
    signingKeyPair: {
        publicKey:
            '0xee64c50eb6b097cee37b534d9d1858128578b465578479533dc69d968aa2be6d',
        privateKey:
            '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb89' +
            '6ee64c50eb6b097cee37b534d9d1858128578b465578479533dc69d968aa2be6d',
    },
    storageEncryptionKey:
        '0xf83a5e0630b32021688bbe37ff8ebac89ba7b07479e4186bdc69ea712e1cb896',
    storageEncryptionNonce: 0,
};

const getSession = async (address: string) => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = formatAddress(address) === SENDER_ADDRESS;
    const isReceiver = formatAddress(address) === RECEIVER_ADDRESS;

    const session = (account: string, token: string, profile: UserProfile) => ({
        account,
        signedUserProfile: {
            profile,
            signature: '',
        },
        token,
    });

    if (isSender) {
        return session(SENDER_ADDRESS, '123', emptyProfile);
    }

    if (isReceiver) {
        return session(RECEIVER_ADDRESS, 'abc', {
            ...emptyProfile,
            publicEncryptionKey: keysB.encryptionKeyPair.publicKey,
        });
    }

    return null;
};

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
                    encryptedData: {} as any,
                    encryptionVersion: 'x25519-chacha20-poly1305',
                    from: SENDER_ADDRESS,
                    to: RECEIVER_ADDRESS,
                },
                token: 'abc',
            },
            '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
            1024,
            getSession,
            storeNewMessage,
            () => {},
        ),
    ).rejects.toEqual(Error('Token check failed'));
});
test('incomingMessage sizeLimit', async () => {
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
                    from: SENDER_ADDRESS,
                    to: RECEIVER_ADDRESS,
                },
                token: '123',
            },
            '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
            1,
            getSession,
            storeNewMessage,
            () => {},
        ),
    ).rejects.toEqual(Error('Message is too large'));
});

test('incomingMessage', async () => {
    //Mock the time so we can test the message with the incomming timestamp
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

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
                encryptedData: {} as any,
                encryptionVersion: 'x25519-chacha20-poly1305',
                from: SENDER_ADDRESS,
                to: RECEIVER_ADDRESS,
            },
            token: '123',
        },
        keysA.signingKeyPair.privateKey,
        1024,
        getSession,
        storeNewMessage,
        () => {},
    );

    const conversationId = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    const actualPostmark = await decryptAsymmetric(
        keysB.encryptionKeyPair,
        JSON.parse(messageContainer.envelop?.postmark!),
    );

    //Check message
    expect(messageContainer).toMatchObject({
        conversationId,
        envelop: {
            encryptedData: {},
            encryptionVersion: 'x25519-chacha20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    });
    //Check Postmark
    expect(JSON.parse(actualPostmark)).toStrictEqual({
        incommingTimestamp: 1577836800000,
        messageHash:
            '0xc496eb97e233a06697fa8bff2f26e72d174d1307686616c1e4e37bc6bdf0f6af',
        signature:
            // eslint-disable-next-line max-len
            '0xdbb4337d68b68a429965607394544be3119d304b02f61ac146ad673cb25088e4' +
            'daf1c946faeb1536975483c4cd4a77254f82ca4eb26cb6876a1ba3ef94b0d00d',
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
                      encryptedData: {} as any,
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                      to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                  },
                  {
                      encryptedData: {} as any,
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                      from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                  },
                  {
                      encryptedData: {} as any,
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                      to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
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
            encryptedData: {},
            encryptionVersion: 'x25519-chacha20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
        {
            encryptedData: {},
            encryptionVersion: 'x25519-chacha20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    ]);
});
