import { assert } from 'console';
import { BigNumber, ethers } from 'ethers';
import { UserProfile } from '../account/Account';
import { decryptAsymmetric } from '../crypto';
import { formatAddress } from '../external-apis/InjectedWeb3API';
import { EncryptionEnvelop } from '../messaging/Messaging';
import { stringify } from '../shared/stringify';
import { getConversationId } from '../storage/Storage';
import { getMessages, incomingMessage } from './Messages';
import * as testData from './Messages.test.json';
import { Session } from './Session';

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

    const session = (
        account: string,
        token: string,
        profile: UserProfile,
    ): Session => ({
        account,
        signedUserProfile: {
            profile,
            signature: '',
        },
        token,
        createdAt: new Date().getTime(),
        profileExtension: {
            encryptionAlgorithm: [],
            notSupportedMessageTypes: [],
        },
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
                    message: '',
                    encryptionVersion: 'x25519-chacha20-poly1305',
                    deliveryInformation: stringify(
                        testData.deliveryInformation,
                    ),
                },
                token: 'abc',
            },
            keysA.signingKeyPair,
            keysA.encryptionKeyPair,
            2 ** 14,
            getSession,
            storeNewMessage,
            () => {},
            {} as ethers.providers.BaseProvider,
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
                    message: '',
                    encryptionVersion: 'x25519-chacha20-poly1305',
                    deliveryInformation: '',
                },
                token: '123',
            },
            keysA.signingKeyPair,
            keysA.encryptionKeyPair,
            1,
            getSession,
            storeNewMessage,
            () => {},
            {} as ethers.providers.BaseProvider,
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
                message: '',
                encryptionVersion: 'x25519-chacha20-poly1305',
                deliveryInformation: stringify(testData.deliveryInformation),
            },
            token: '123',
        },
        keysA.signingKeyPair,
        keysA.encryptionKeyPair,
        2 ** 14,
        getSession,
        storeNewMessage,
        () => {},
        {} as ethers.providers.BaseProvider,
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
    expect(messageContainer.conversationId).toEqual(conversationId);

    expect(messageContainer.envelop).toEqual(
        expect.objectContaining({
            message: '',
            deliveryInformation: expect.any(String),
            encryptionVersion: 'x25519-chacha20-poly1305',
        }),
    );

    //Check Postmark
    expect(JSON.parse(actualPostmark)).toStrictEqual({
        incommingTimestamp: 1577836800000,
        messageHash:
            '0xd7c617eb7ffee435e7d4e7f6b13d46ccdf88d2e5463148c50659e5cd88d248b5',
        signature:
            // eslint-disable-next-line max-len
            '0x944b3207908f07f02d3a0635adb7b28d143cbb58da287c8e4adac18919964fa2' +
            '2944cfef3cd38153e2145391562d9976bf9582fbf680efeb647e56e5187bd60d',
    });
});
test('incomingMessage -- rejects sender with a nonce below the filter', async () => {
    //Mock the time so we can test the message with the incomming timestamp
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

    let messageContainer: {
        conversationId?: string;
        envelop?: EncryptionEnvelop;
    } = {};

    const session = async (address: string) =>
        ({
            ...(await getSession(address)),
            spamFilterRules: { minNonce: 2 },
        } as Session);

    const provider = {
        getTransactionCount: async (_: string) => Promise.resolve(0),
    } as ethers.providers.BaseProvider;

    const storeNewMessage = async (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => {
        messageContainer = { conversationId, envelop };
    };

    try {
        await incomingMessage(
            {
                envelop: {
                    message: '',
                    encryptionVersion: 'x25519-chacha20-poly1305',
                    deliveryInformation: stringify(
                        testData.deliveryInformation,
                    ),
                },
                token: '123',
            },
            keysA.signingKeyPair,
            keysA.encryptionKeyPair,
            2 ** 14,
            session,
            storeNewMessage,
            () => {},
            provider,
        );
        fail();
    } catch (err: any) {
        expect(err.message).toBe('Message does not match spam criteria');
    }
});
test('incomingMessage -- rejects sender with a balance below the filter', async () => {
    //Mock the time so we can test the message with the incomming timestamp
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

    let messageContainer: {
        conversationId?: string;
        envelop?: EncryptionEnvelop;
    } = {};

    const session = async (address: string) =>
        ({
            ...(await getSession(address)),
            spamFilterRules: { minBalance: '0xa' },
        } as Session);

    const provider = {
        getBalance: async (_: string) => Promise.resolve(BigNumber.from(5)),
    } as ethers.providers.BaseProvider;

    const storeNewMessage = async (
        conversationId: string,
        envelop: EncryptionEnvelop,
    ) => {
        messageContainer = { conversationId, envelop };
    };

    try {
        await incomingMessage(
            {
                envelop: {
                    message: '',
                    encryptionVersion: 'x25519-chacha20-poly1305',
                    deliveryInformation: stringify(
                        testData.deliveryInformation,
                    ),
                },
                token: '123',
            },
            keysA.signingKeyPair,
            keysA.encryptionKeyPair,
            2 ** 14,
            session,
            storeNewMessage,
            () => {},
            provider,
        );
        fail();
    } catch (err: any) {
        expect(err.message).toBe('Message does not match spam criteria');
    }
});

test('getMessages', async () => {
    const conversationIdToUse = getConversationId(
        '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
    );

    const loadMessages = async (
        conversationId: string,
        offset: number,
        size: number,
    ): Promise<EncryptionEnvelop[]> => {
        return conversationId === conversationIdToUse
            ? ([
                  {
                      message: '',
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      deliveryInformation: stringify(
                          testData.deliveryInformation,
                      ),
                  },
                  {
                      message: '',
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      deliveryInformation: stringify(
                          testData.deliveryInformationB,
                      ),
                  },
                  {
                      message: '',
                      encryptionVersion: 'x25519-chacha20-poly1305',
                      deliveryInformation: stringify(
                          testData.deliveryInformation,
                      ),
                  },
              ] as EncryptionEnvelop[])
            : [];
    };

    expect(
        await getMessages(
            loadMessages,
            keysA.encryptionKeyPair,
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
        ),
    ).toStrictEqual([
        {
            message: '',
            encryptionVersion: 'x25519-chacha20-poly1305',
            deliveryInformation: stringify(testData.deliveryInformation),
        },
        {
            message: '',
            encryptionVersion: 'x25519-chacha20-poly1305',
            deliveryInformation: stringify(testData.deliveryInformation),
        },
    ]);
});
