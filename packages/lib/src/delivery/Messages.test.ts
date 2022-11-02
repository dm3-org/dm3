import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { UserProfile } from '../account/Account';
import { decryptSafely } from '../encryption/Encryption';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { getConversationId } from '../storage/Storage';
import { getMessages, incomingMessage } from './Messages';

const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const { secretKey, publicKey } = nacl.box.keyPair();

const receiverPublicEncryptionKey = encodeBase64(publicKey);
const receiverPrivateKey = encodeBase64(secretKey);

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
            publicEncryptionKey: receiverPublicEncryptionKey,
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
                    encryptedData: '',
                    encryptionVersion: 'x25519-xsalsa20-poly1305',
                    from: SENDER_ADDRESS,
                    to: RECEIVER_ADDRESS,
                },
                token: 'abc',
            },
            '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
            getSession,
            storeNewMessage,
            () => {},
        ),
    ).rejects.toEqual(Error('Token check failed'));
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
                encryptedData: '',
                encryptionVersion: 'x25519-xsalsa20-poly1305',
                from: SENDER_ADDRESS,
                to: RECEIVER_ADDRESS,
            },
            token: '123',
        },
        {
            publicEncryptionKey: 'Vrd/eTAk/jZb/w5L408yDjOO5upNFDGdt0lyWRjfBEk=',
            url: '',
            publicSigningKey:
                '9SZhajjn9tn0fX/eBMXfZfb0RaUeYyfhlNYHqZyKHpyTiYvwVosQ5qt2XxdDFblTzggir8kp85kWw76p2EZ0rQ==',
        },
        getSession,
        storeNewMessage,
        () => {},
    );

    const conversationId = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    const actualPostmark = decryptSafely({
        //@ts-ignore
        encryptedData: JSON.parse(messageContainer.envelop?.postmark!),
        privateKey: receiverPrivateKey,
    });

    //Check message
    expect(messageContainer).toMatchObject({
        conversationId,
        envelop: {
            encryptedData: '',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    });
    //Check Postmark
    expect(actualPostmark).toStrictEqual({
        incommingTimestamp: 1577836800000,
        messageHash:
            '0x5f35dce98ba4fba25530a026ed80b2cecdaa31091ba4958b99b52ea1d068adad',
        signature:
            // eslint-disable-next-line max-len
            '0x625a5500c56fdb7fd21f83a142a52c78a2fa33148450ea1a57918a289d22a85aaef58a92d1221b8300849c58b2a5c0afc463526b00bbb9940ec59b9c8012cb00',
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
                  },
                  {
                      encryptedData: 'b',
                      encryptionVersion: 'x25519-xsalsa20-poly1305',
                      to: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                      from: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
                  },
                  {
                      encryptedData: 'c',
                      encryptionVersion: 'x25519-xsalsa20-poly1305',
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
            encryptedData: 'a',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
        {
            encryptedData: 'c',
            encryptionVersion: 'x25519-xsalsa20-poly1305',
            from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            to: '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
        },
    ]);
});
