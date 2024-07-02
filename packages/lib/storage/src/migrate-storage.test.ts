import {
    createStorageKey,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import { createProfileKeys } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { StorageEnvelopContainer } from './new/types';
import { Message, Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';
import { StorageAPI } from '../dist';
import { Conversation } from './new/types';
import { migrageStorage } from './new/migrateStorage';
import { createDB } from './Storage';

const USER_1 = 'alice.eth';
const USER_2 = 'bob.eth';

const getMockProfileKeys = async () => {
    const nonce = '0';
    const wallet = new ethers.Wallet(
        '0xac58f2f021d6f148fd621b355edbd0ebadcf9682019015ef1219cf9c0c2ddc8b',
    );

    const nonceMsg = getStorageKeyCreationMessage(nonce, wallet.address);
    const signedMessage = await wallet.signMessage(nonceMsg);

    return await createProfileKeys(
        await createStorageKey(signedMessage),
        nonce,
    );
};
const getStorageEnvelopeContainer = (msg: string, timestamp: number = 0) => {
    const message: Message = {
        metadata: {
            to: '',
            from: USER_1,
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

    return {
        messageState: MessageState.Created,
        envelop: envelop,
        deliveryServiceIncommingTimestamp: 123,
    } as StorageEnvelopContainer;
};
describe('MigrateStorage', () => {
    let newStorage: StorageAPI;

    beforeEach(() => {
        //Mock newStorage
        newStorage = (() => {
            const conversations = new Map<string, any[]>();

            return {
                getConversations: async (page: number) =>
                    Array.from(conversations.keys()).map((contactEnsName) => ({
                        contactEnsName,
                        isHidden: false,
                        previewMessage: undefined,
                    })),
                getMessages: async (contactEnsName: string, page: number) => [],
                addMessageBatch: async (
                    contactEnsName: string,
                    batch: StorageEnvelopContainer[],
                ) => {
                    conversations.set(contactEnsName, [
                        ...(conversations.get(contactEnsName) ?? []),
                        ...batch,
                    ]);
                    return '';
                },
                editMessageBatch: async (
                    contactEnsName: string,
                    editedMessage: StorageEnvelopContainer[],
                ) => {},
                getNumberOfMessages: async (contactEnsName: string) => 0,
                getNumberOfConverations: async () => 0,
                addConversation: async (contactEnsName: string) => {
                    conversations.set(contactEnsName, []);
                },
                addMessage: async (
                    contactEnsName: string,
                    envelop: StorageEnvelopContainer,
                ) => '',
                toggleHideConversation: async (
                    contactEnsName: string,
                    isHidden: boolean,
                ) => {},
            };
        })();
    });
    it('should migrate storage', async () => {
        const profileKeys = await getMockProfileKeys();
        const db = createDB(profileKeys);
        db.conversations.set(USER_1, [
            getStorageEnvelopeContainer('hello', 1),
            getStorageEnvelopeContainer('dm3', 2),
        ]);
        db.conversations.set(USER_2, [
            getStorageEnvelopeContainer('123', 1),
            getStorageEnvelopeContainer('456', 2),
        ]);

        const tldResolver = async (ensName: string) => {
            return ensName.replace('.eth', '.addr.user.dm3.eth');
        };

        await migrageStorage(db, newStorage, tldResolver);

        const newConversations = await newStorage.getConversations(100, 0);
        0.45;
        expect(newConversations.length).toBe(2);
        expect(newConversations[0].contactEnsName).toBe(
            'alice.addr.user.dm3.eth',
        );
        expect(newConversations[1].contactEnsName).toBe(
            'bob.addr.user.dm3.eth',
        );
    });
    it('resolve tld names', async () => {
        const profileKeys = await getMockProfileKeys();
        const db = createDB(profileKeys);
        db.conversations.set(USER_1, [
            getStorageEnvelopeContainer('hello', 1),
            getStorageEnvelopeContainer('dm3', 2),
        ]);
        db.conversations.set('foo.addr.user.dm3.gno', [
            getStorageEnvelopeContainer('123', 1),
            getStorageEnvelopeContainer('456', 2),
        ]);

        const tldResolver = async (ensName: string) => {
            return ensName.replace('.eth', '.addr.user.dm3.eth');
        };

        await migrageStorage(db, newStorage, tldResolver);

        const newConversations = await newStorage.getConversations(100, 0);
        0.45;
        expect(newConversations.length).toBe(2);
        expect(newConversations[0].contactEnsName).toBe(
            'alice.addr.user.dm3.eth',
        );
        expect(newConversations[1].contactEnsName).toBe(
            'foo.addr.user.dm3.gno',
        );
    });
});
