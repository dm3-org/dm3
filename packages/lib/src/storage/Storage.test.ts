import exp from 'constants';
import { ethers } from 'ethers';
import { Message } from '../../dist.backend/messaging';
import { createProfileKeys } from '../account/profileKeys/createProfileKeys';
import { getStorageKeyCreationMessage, createStorageKey } from '../crypto';
import { Envelop, MessageState } from '../messaging';
import { Connection } from '../web3-provider/Web3Provider';
import {
    createDB,
    getConversation,
    load,
    parseConversations,
    serializeConversations,
    sortEnvelops,
    StorageEnvelopContainer,
    sync,
} from './Storage';

const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const USER_ADDRESS_2 = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const USER_ADDRESS_3 = '0x09c3d8547020a044c4879cD0546D448D362124Ae';

const getStorageEnvelopeContainer = (timestamp: number = 0) => {
    const message: Message = {
        to: '',
        from: USER_ADDRESS_1,
        timestamp,
        message: '',
        type: 'NEW',
        signature: '',
    };

    const envelop: Envelop = {
        message,
        signature: '',
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
            const conversion1ID = USER_ADDRESS_1 + USER_ADDRESS_2;
            const conversion2ID = USER_ADDRESS_2 + USER_ADDRESS_3;

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
        it("Returns an empty array if the db don't contains a particular conversation", () => {
            const profileKeys = {
                encryptionKeyPair: {
                    publicKey: '',
                    privateKey: '',
                },
                signingKeyPair: {
                    publicKey: '',
                    privateKey: '',
                },
                storageEncryptionKey: '',
                storageEncryptionNonce: 0,
            };

            const connection = {
                account: { address: USER_ADDRESS_2 },
            } as Connection;
            const db = createDB(profileKeys);

            const conversations = getConversation(
                USER_ADDRESS_1,
                connection,
                db,
            );

            expect(conversations).toStrictEqual([]);
        });
        it('Returns the conversation between the account specified in the connection and the contact ', async () => {
            const connection = {
                account: { address: USER_ADDRESS_2 },
            } as Connection;

            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const conversationId = USER_ADDRESS_1 + USER_ADDRESS_2;

            const expectedConversation = [getStorageEnvelopeContainer()];

            db.conversations.set(conversationId, expectedConversation);

            const actualConversation = getConversation(
                USER_ADDRESS_1,
                connection,
                db,
            );

            expect(actualConversation).toStrictEqual(actualConversation);
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

        it('Sync Acknoledgements', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const conversation = [
                getStorageEnvelopeContainer(),
                getStorageEnvelopeContainer(),
            ];

            const conversationId = USER_ADDRESS_1 + USER_ADDRESS_2;

            db.conversations.set(conversationId, conversation);

            const { acknoledgments, userStorage } = await sync(db, '');

            expect(acknoledgments.length).toBe(1);
            expect(acknoledgments).toStrictEqual([
                {
                    contactAddress: USER_ADDRESS_1,
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
        it('Filter empty conversations', async () => {
            const profileKeys = await getMockProfileKeys();

            const db = createDB(profileKeys);

            const conversation = [getStorageEnvelopeContainer()];

            const conversationId = USER_ADDRESS_1 + USER_ADDRESS_2;
            const emptyConversion = USER_ADDRESS_1 + USER_ADDRESS_3;

            db.conversations.set(conversationId, conversation);
            db.conversations.set(emptyConversion, []);

            const { acknoledgments, userStorage } = await sync(db, '');

            expect(acknoledgments.length).toBe(1);
            expect(acknoledgments).toStrictEqual([
                {
                    contactAddress: USER_ADDRESS_1,
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
    });
});
