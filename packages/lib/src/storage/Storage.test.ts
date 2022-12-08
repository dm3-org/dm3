import { Message } from '../../dist.backend/messaging';
import { Envelop, MessageState } from '../messaging';
import {
    parseConversations,
    serializeConversations,
    StorageEnvelopContainer,
    sync,
} from './Storage';

const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const USER_ADDRESS_2 = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';
const USER_ADDRESS_3 = '0x09c3d8547020a044c4879cD0546D448D362124Ae';

describe('Storage', () => {
    describe('Serialize Conversations', () => {
        it('Should serialize a conversation properly', () => {
            const conversion1ID = USER_ADDRESS_1 + USER_ADDRESS_2;
            const conversion2ID = USER_ADDRESS_2 + USER_ADDRESS_3;

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

            const storageEnvelopContainer: StorageEnvelopContainer = {
                messageState: MessageState.Created,
                envelop: envelop,
            };

            const conversations = new Map<string, StorageEnvelopContainer[]>();

            conversations.set(conversion1ID, [storageEnvelopContainer]);
            conversations.set(conversion2ID, [
                storageEnvelopContainer,
                storageEnvelopContainer,
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
                storageEnvelopContainer,
            ]);
            expect(deserializedConversations.get(conversion2ID)).toStrictEqual([
                storageEnvelopContainer,
                storageEnvelopContainer,
            ]);
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
