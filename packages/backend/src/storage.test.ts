import bodyParser from 'body-parser';
import express from 'express';
import auth from './auth';
import storage from './storage';
import request from 'supertest';
import winston from 'winston';
import { addConversation } from './persistance/storage/postgres/addConversation';
import { PrismaClient } from '@prisma/client';
import { getConversationList } from './persistance/storage/postgres/getConversationList';
import { addMessage } from './persistance/storage/postgres/addMessage';
import {
    Envelop,
    Message,
    buildEnvelop,
    createMessage,
} from '@dm3-org/dm3-lib-messaging';
import { ethers } from 'ethers';
import {
    MockedDeliveryServiceProfile,
    MockedUserProfile,
    mockDeliveryServiceProfile,
    mockUserProfile,
} from '../test/testHelper';
import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { DeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { sha256 } from '@dm3-org/dm3-lib-shared';
import { getMessages } from './persistance/storage/postgres/getMessages';

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

global.logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});

describe('Storage', () => {
    let prisma: PrismaClient;
    let sender: MockedUserProfile;
    let receiver: MockedUserProfile;
    let deliveryService: MockedDeliveryServiceProfile;
    beforeEach(async () => {
        prisma = new PrismaClient();

        const bobWallet = ethers.Wallet.createRandom();
        const aliceWallet = ethers.Wallet.createRandom();
        const dsWallet = ethers.Wallet.createRandom();

        sender = await mockUserProfile(bobWallet, 'bob.eth', [
            'http://localhost:3000',
        ]);
        receiver = await mockUserProfile(aliceWallet, 'alice.eth', [
            'http://localhost:3000',
        ]);
        deliveryService = await mockDeliveryServiceProfile(
            dsWallet,
            'http://localhost:3000',
        );
    });

    afterEach(async () => {
        await prisma.encryptedMessage.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.account.deleteMany();
    });

    describe('addConversation', () => {
        it('can add conversation', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                storage_addConversation: addConversation(prisma),
                storage_getConversationList: getConversationList(prisma),
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const aliceId = 'alice.eth';

            const { status } = await request(app)
                .post(`/new/bob.eth/addConversation`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    encryptedId: aliceId,
                });
            expect(status).toBe(200);

            const { body } = await request(app)
                .get(`/new/bob.eth/conversationList`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(body).toEqual([aliceId]);
            expect(body.length).toBe(1);
        });
    });
    describe('addMessage', () => {
        it('can add message', async () => {
            const app = express();
            app.use(bodyParser.json());
            app.use(storage());

            const token = await createAuthToken();

            app.locals.db = {
                getSession: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
                    }),
                setSession: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                storage_addMessage: addMessage(prisma),
                storage_getMessages: getMessages(prisma),
                storage_getConversationList: getConversationList(prisma),
            };

            app.locals.web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const message = await createMessage(
                sender.account.ensName,
                receiver.account.ensName,
                'Hello',
                sender.profileKeys.signingKeyPair.privateKey,
            );
            const { encryptedEnvelop, envelop } = await buildEnvelop(
                message,
                (receiverPublicSigningKey: string, message: string) => {
                    return encryptAsymmetric(receiverPublicSigningKey, message);
                },
                {
                    from: sender.account,
                    to: receiver.account,
                    deliverServiceProfile: deliveryService.profile,
                    keys: sender.profileKeys,
                },
            );

            console.log('envelopCheck');

            const { status } = await request(app)
                .post(`/new/bob.eth/addMessage`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    message: JSON.stringify(encryptedEnvelop),
                    encryptedContactName: sha256(receiver.account.ensName),
                    messageId: '123',
                });
            expect(status).toBe(200);
            console.log('sendCheck');

            const { body } = await request(app)
                .get(`/new/bob.eth/conversationList`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(body).toEqual([sha256(receiver.account.ensName)]);
            expect(body.length).toBe(1);
        });
    });
});

const createAuthToken = async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use(auth());

    app.locals = {
        web3Provider: {
            resolveName: async () =>
                '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
        },
        redisClient: {
            exists: (_: any) => false,
        },
    };

    app.locals.db = {
        getSession: async (accountAddress: string) =>
            Promise.resolve({
                challenge: 'my-Challenge',
                signedUserProfile: {
                    profile: {
                        publicSigningKey: keysA.signingKeyPair.publicKey,
                    },
                },
            }),
        setSession: async (_: string, __: any) => {
            return (_: any, __: any, ___: any) => {};
        },
        getIdEnsName: async (ensName: string) => ensName,
    };

    const signature =
        '3A893rTBPEa3g9FL2vgDreY3vvXnOiYCOoJURNyctncwH' +
        '0En/mcwo/t2v2jtQx/pcnOpTzuJwLuZviTQjd9vBQ==';

    const { body } = await request(app).post(`/bob.eth`).send({
        signature,
    });

    return body.token;
};
export function makeEnvelop(
    from: string,
    to: string,
    msg: string,
    timestamp: number = 0,
) {
    const message: Message = {
        metadata: {
            to,
            from,
            timestamp,
            type: 'NEW',
        },
        message: msg,
        signature: '',
    };

    const envelop: Envelop = {
        message,
        metadata: {
            deliveryInformation: {
                from: '',
                to: '',
                deliveryInstruction: '',
            },
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: '',
            signature: '',
        },
    };

    return envelop;
}
