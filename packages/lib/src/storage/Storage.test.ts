import { ethers } from 'ethers';
import { createProfileKeys } from '../account/profileKeys/createProfileKeys';
import { createStorageKey, getStorageKeyCreationMessage } from '../crypto';
import { Envelop, Message, MessageState } from '../messaging';
import { Connection } from '../web3-provider/Web3Provider';
import {
    createDB,
    createEmptyConversation,
    getConversation,
    getConversationId,
    load,
    parseConversations,
    serializeConversations,
    sortEnvelops,
    StorageEnvelopContainer,
    sync,
} from './Storage';

const USER_1 = 'alice.eth';
const USER_2 = 'bob.eth';
const USER_3 = 'joe.eth';

const getStorageEnvelopeContainer = (timestamp: number = 0) => {
    const message: Message = {
        metadata: {
            to: '',
            from: USER_1,
            timestamp,
            type: 'NEW',
        },
        message: '',
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

    return {
        messageState: MessageState.Created,
        envelop: envelop,
        deliveryServiceIncommingTimestamp: 123,
    } as StorageEnvelopContainer;
};
const getMockProfileKeys = async () => {
    const nonce = 0;
    const wallet = new ethers.Wallet(
        '0xac58f2f021d6f148fd621b355edbd0ebadcf9682019015ef1219cf9c0c2ddc8b',
    );

    const nonceMsg = getStorageKeyCreationMessage(nonce);
    const signedMessage = await wallet.signMessage(nonceMsg);

    return await createProfileKeys(
        await createStorageKey(signedMessage),
        nonce,
    );
};

describe('Storage', () => {
    describe('Serialize Conversations', () => {
        it('Should serialize a conversation properly', () => {
            const conversion1ID = USER_1 + ',' + USER_2;
            const conversion2ID = USER_2 + ',' + USER_3;

            const conversations = new Map<string, StorageEnvelopContainer[]>();

            conversations.set(conversion1ID, [getStorageEnvelopeContainer()]);
            conversations.set(conversion2ID, [
                getStorageEnvelopeContainer(),
                getStorageEnvelopeContainer(),
            ]);

            const conversationString = JSON.stringify(
                conversations,
                serializeConversations,
            );

            const deserializedConversations = JSON.parse(
                conversationString,
                parseConversations,
            ) as Map<string, StorageEnvelopContainer[]>;

            expect(deserializedConversations.get(conversion1ID)).toStrictEqual([
                getStorageEnvelopeContainer(),
            ]);
            expect(deserializedConversations.get(conversion2ID)).toStrictEqual([
                getStorageEnvelopeContainer(),
                getStorageEnvelopeContainer(),
            ]);
        });
    });

    describe('getConversation', () => {
        it("Returns an empty array if the db don't contains a particular conversation", async () => {
            const profileKeys = await getMockProfileKeys();

            const connection = {
                account: { ensName: USER_2 },
            } as Connection;
            const db = createDB(profileKeys);

            const conversations = getConversation(
                USER_1,
                [{ ensName: USER_1 }],
                db,
            );

            expect(conversations).toStrictEqual([]);
        });
        it('Returns the conversation between the account specified in the connection and the contact ', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const expectedConversation = [getStorageEnvelopeContainer()];

            db.conversations.set(USER_1, expectedConversation);

            const actualConversation = getConversation(
                USER_1,
                [{ ensName: USER_1 }],
                db,
            );
            expect(actualConversation).toStrictEqual(expectedConversation);
        });
    });

    describe('sortEnvelops', () => {
        const envelopContainer1 = getStorageEnvelopeContainer(1);
        const envelopContainer2 = getStorageEnvelopeContainer(2);
        const envelopContainer3 = getStorageEnvelopeContainer(3);

        const sortedEnvelops = sortEnvelops([
            envelopContainer2,
            envelopContainer3,
            envelopContainer1,
        ]);

        expect(sortedEnvelops).toStrictEqual([
            envelopContainer1,
            envelopContainer2,
            envelopContainer3,
        ]);
    });
    describe('Sync / Load', () => {
        it(`Should throw if userDb isn't set`, async () => {
            expect.assertions(1);
            await expect(() => sync(undefined, '')).rejects.toEqual(
                Error(`User db hasn't been create`),
            );
        });

        it('Sync Db with conversations', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const conversation = [
                getStorageEnvelopeContainer(),
                getStorageEnvelopeContainer(),
            ];

            const conversationId = USER_1 + USER_2;

            db.conversations.set(conversationId, conversation);

            const { acknoledgments, userStorage } = await sync(db, '');

            expect(acknoledgments.length).toBe(1);
            expect(acknoledgments).toStrictEqual([
                {
                    contactAddress: USER_1,
                    messageDeliveryServiceTimestamp: 123,
                },
            ]);

            const loadDb = await load(
                userStorage,
                profileKeys.storageEncryptionKey,
            );

            expect(loadDb.conversations.get(conversationId)).toStrictEqual(
                conversation,
            );
        });
        it('Sync db and filter empty conversations', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const conversation = [getStorageEnvelopeContainer()];

            const conversationId = USER_1 + ',' + USER_2;
            const emptyConversion = USER_1 + ',' + USER_3;

            db.conversations.set(conversationId, conversation);
            db.conversations.set(emptyConversion, []);

            const { acknoledgments, userStorage } = await sync(db, '');

            expect(acknoledgments.length).toBe(1);
            expect(acknoledgments).toStrictEqual([
                {
                    contactAddress: USER_1,
                    messageDeliveryServiceTimestamp: 123,
                },
            ]);

            const loadDb = await load(
                userStorage,
                profileKeys.storageEncryptionKey,
            );

            expect(loadDb.conversations.get(conversationId)).toStrictEqual(
                conversation,
            );
        });
        it('Sync db without conversations', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const { acknoledgments, userStorage } = await sync(db, '');

            expect(acknoledgments.length).toBe(0);
            expect(acknoledgments).toStrictEqual([]);

            const loadDb = await load(
                userStorage,
                profileKeys.storageEncryptionKey,
            );

            expect(loadDb.conversationsCount).toBe(0);
        });
    });
});
