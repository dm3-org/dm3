import { checkSignature, decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { EncryptionEnvelop, Postmark } from '@dm3-org/dm3-lib-messaging';
import { UserProfile, normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { sha256 } from '@dm3-org/dm3-lib-shared';
import { BigNumber, ethers } from 'ethers';
import { testData } from '../../../../test-data/encrypted-envelops.test';
import { stringify } from '../../shared/src/stringify';
import { getConversationId, getMessages, incomingMessage } from './Messages';
import { Session } from './Session';
import {
    IWebSocketManager,
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
import { SpamFilterRules } from './spam-filter/SpamFilterRules';

const SENDER_NAME = 'alice.eth';
const RECEIVER_NAME = 'bob.eth';
const SENDER_ADDRESS = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const RECEIVER_ADDRESS = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const keysA = {
    encryptionKeyPair: {
        publicKey: 'eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=',
        privateKey: 'pMI77F2w3GK+omZCB4A61WDqISOOnWGXR2f/MTLbqbY=',
    },
    signingKeyPair: {
        publicKey: '+tkDQWZfv9ixBmObsf8tgTHTZajwAE9muTtFAUj2e9I=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJX62QNBZl+/2LEGY5ux/y2BMdNlqPAAT2a5O0UBSPZ70g==',
    },
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    storageEncryptionNonce: 0,
};

const keysB = {
    encryptionKeyPair: {
        publicKey: 'GYZ1ZQZvyGyHb28CcAb2Ttq+Q1FV//pSaXRurAAUJgg=',
        privateKey: 'OVZDqoByMGbEzhxdHcTurzpEwxxP2/1EMiNUx+ST5g4=',
    },
    signingKeyPair: {
        publicKey: '7mTFDrawl87je1NNnRhYEoV4tGVXhHlTPcadloqivm0=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJbuZMUOtrCXzuN7U02dGFgShXi0ZVeEeVM9xp2WiqK+bQ==',
    },
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJY=',
    storageEncryptionNonce: 0,
};

const getSession = async (
    ensName: string,
    socketId?: string,
): Promise<(Session & { spamFilterRules: SpamFilterRules }) | null> => {
    const emptyProfile: UserProfile = {
        publicSigningKey: '',
        publicEncryptionKey: '',
        deliveryServices: [''],
    };
    const isSender = normalizeEnsName(ensName) === SENDER_NAME;
    const isReceiver = normalizeEnsName(ensName) === RECEIVER_NAME;

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
        socketId,
    });

    if (isSender) {
        return {
            ...session(SENDER_NAME, '123', emptyProfile),
            spamFilterRules: {},
        };
    }

    if (isReceiver) {
        return {
            ...session(RECEIVER_NAME, 'abc', {
                ...emptyProfile,
                publicEncryptionKey: keysB.encryptionKeyPair.publicKey,
            }),
            spamFilterRules: {},
        };
    }

    return null;
};

const getNotificationChannels = (user: string) => {
    return Promise.resolve([]);
};
jest.mock('nodemailer');

const sendMailMock = jest.fn();

const nodemailer = require('nodemailer'); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({
    sendMail: sendMailMock,
    close: () => {},
});

describe('Messages', () => {
    ƒ;
    describe('GetMessages', () => {
        it('returns all messages of the user', async () => {
            const conversationIdToUse = getConversationId(
                'alice.eth',
                'bob.eth',
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
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.deliveryInformationUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.deliveryInformationUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                          {
                              message: '',
                              metadata: {
                                  encryptionScheme: 'x25519-chacha20-poly1305',
                                  deliveryInformation:
                                      testData.delvieryInformationBUnecrypted,
                                  version: '',
                                  encryptedMessageHash: '',
                                  signature: '',
                              },
                          },
                      ] as EncryptionEnvelop[])
                    : [];
            };

            expect(
                await getMessages(
                    loadMessages,
                    keysA.encryptionKeyPair,
                    'bob.eth',
                    'alice.eth',
                ),
            ).toStrictEqual([
                {
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation:
                            testData.deliveryInformationUnecrypted,
                        encryptedMessageHash: '',
                        signature: '',
                        version: '',
                    },
                },
                {
                    message: '',
                    metadata: {
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation:
                            testData.deliveryInformationUnecrypted,
                        version: '',
                        encryptedMessageHash: '',
                        signature: '',
                    },
                },
            ]);
        });
    });
});
