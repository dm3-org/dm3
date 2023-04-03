import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop, Message, SendDependencies } from '.';
import { createProfileKeys } from 'dm3-lib-profile';
import {
    createStorageKey,
    encryptAsymmetric,
    getStorageKeyCreationMessage,
} from 'dm3-lib-crypto';
import { DeliveryServiceProfile } from 'dm3-lib-profile/src/deliveryServiceProfile/Delivery';
import { stringify } from 'dm3-lib-shared';
import { StorageLocation, UserDB } from '../../storage';
import { Connection, ConnectionState } from '../web3-provider/Web3Provider';

const USER_NAME_1 = 'alice.eth';
const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const USER_NAME_2 = 'bob.eth';
const USER_ADDRESS_2 = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

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

describe('fetchAndStoreMessages', () => {
    it('Throws Exception if connection has no account', async () => {
        const connection = {} as Connection;
        const deliveryServiceToken = '';
        const contact = USER_NAME_2;
        const getNewMessages = jest.fn();
        const storeMessages = () => {};
        const userDb = {} as UserDB;

        const getDeliveryServiceProfile = () => Promise.resolve(undefined);

        expect(async () => {
            await getMessages(
                connection,
                deliveryServiceToken,
                contact,
                getNewMessages,
                storeMessages,
                getDeliveryServiceProfile,
                userDb,
            );
        }).rejects.toEqual(Error('Account has no profile'));
    });
    it('Returns empty array if user has no new messages', async () => {
        const connection = {
            connectionState: ConnectionState.SignedIn,
            storageLocation: StorageLocation.dm3Storage,
            defaultServiceUrl: '',
            account: {
                profile: {
                    deliveryServices: ['foo.eth'],
                    publicEncryptionKey: '',
                    publicSigningKey: '',
                },
                ensName: USER_NAME_1,
            },
            provider: {
                getResolver: () => {
                    getText: () => {
                        return 'data:text/json';
                    };
                },
            } as unknown as ethers.providers.BaseProvider,
        } as Connection;

        const deliveryServiceToken = '';
        const contact = USER_NAME_2;

        const keys = await getMockProfileKeys();

        const message: Message = {
            message: 'my-msg',
            metadata: { from: '', to: '', timestamp: 0, type: 'NEW' },
            signature: '',
            attachments: [],
        };

        const encryptedMsg = await encryptAsymmetric(
            keys.encryptionKeyPair.publicKey,
            JSON.stringify(message),
        );

        const encrypedPostmark = await encryptAsymmetric(
            keys.encryptionKeyPair.publicKey,
            JSON.stringify({
                messageHash: '',
                incommingTimestamp: '',
                signature: '',
            }),
        );

        const getNewMessages = jest.fn(() =>
            Promise.resolve([
                {
                    message: JSON.stringify(encryptedMsg),
                    metadata: {
                        version: '',
                        encryptedMessageHash: '',
                        signature: '',
                        encryptionScheme: 'x25519-chacha20-poly1305',
                        deliveryInformation: stringify({}),
                    },
                    postmark: JSON.stringify(encrypedPostmark),
                },
            ]),
        );

        const getDeliveryServiceProfile = () =>
            Promise.resolve({
                url: 'www.foo.io',
            } as DeliveryServiceProfile);

        const storeMessages = () => {};
        const userDb = {
            conversations: new Map(),
            keys,
        } as UserDB;

        const messages = await getMessages(
            connection,
            deliveryServiceToken,
            contact,
            getNewMessages,
            storeMessages,
            getDeliveryServiceProfile,
            userDb,
        );

        expect(messages).toStrictEqual([]);
    });
});
