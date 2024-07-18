import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { testData } from '../../../../test-data/encrypted-envelops.test';
import { getConversationId, getMessages } from './Messages';

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

describe('Messages', () => {
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
