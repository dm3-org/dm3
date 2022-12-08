import { Message } from '../../dist.backend/messaging';
import { Envelop, MessageState } from '../messaging';
import { Connection } from '../web3-provider/Web3Provider';
import {
    createDB,
    getConversation,
    parseConversations,
    serializeConversations,
    StorageEnvelopContainer,
    sync,
} from './Storage';

const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const USER_ADDRESS_2 = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const USER_ADDRESS_3 = '0x09c3d8547020a044c4879cD0546D448D362124Ae';

const getStorageEnvelopeContainer = () => {
    const message: Message = {
        to: '',
        from: '',
        timestamp: 0,
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
    } as StorageEnvelopContainer;
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
        it('Returns the conversation between the account specified in the connection and the contact ', () => {
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

    describe('Sync', () => {
        it(`Should throw if userDb isn't set`, async () => {
            expect.assertions(1);
            await expect(() => sync(undefined, '')).rejects.toEqual(
                Error(`User db hasn't been create`),
            );
        });
    });
});
