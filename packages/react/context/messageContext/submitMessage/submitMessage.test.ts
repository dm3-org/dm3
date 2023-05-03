import { createProfileKeys } from 'dm3-lib-profile';
import { createStorageKey, getStorageKeyCreationMessage } from 'dm3-lib-crypto';
import { ethers } from 'ethers';
import { EncryptionEnvelop, Envelop, Message, SendDependencies } from '.';
import { Connection } from '../web3-provider/Web3Provider';

const USER_NAME_1 = 'alice.eth';
const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';
const USER_NAME_2 = 'bob.eth';
const USER_ADDRESS_2 = '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855';

const getMockProfileKeys = async () => {
    const nonce = '0';
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

describe('submitMessage', () => {
    it('stores a message if the delivery is halted', async () => {
        const connection = {} as Connection;
        const deliverySerivceToken = '';
        const message: Message = {
            metadata: {
                to: '',
                from: USER_NAME_1,
                timestamp: 123,
                type: 'NEW',
            },
            message: '',
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            deliveryServiceEncryptionPubKey: '',
            keys: await getMockProfileKeys(),
            from: {
                ensName: '',
                profile: {
                    deliveryServices: [],
                    publicEncryptionKey: '',
                    publicSigningKey: '',
                },
            },
            to: {
                ensName: '',
                profile: {
                    deliveryServices: [],
                    publicEncryptionKey: '',
                    publicSigningKey: '',
                },
            },
        };
        const submitMessageApi = jest.fn();
        const encryptAsymmetric = (publicKey: string, payload: string) => {
            return Promise.resolve({
                nonce: '',
                ciphertext: payload,
                ephemPublicKey: '',
            });
        };
        const createPendingEntry = jest.fn();
        const haltDelivery = true;
        const storeMessages = jest.fn();
        const onSuccess = jest.fn();

        await submitMessage(
            connection,
            deliverySerivceToken,
            sendDependencies,
            message,
            submitMessageApi,
            encryptAsymmetric,
            createPendingEntry,
            haltDelivery,
            storeMessages,
            onSuccess,
        );

        expect(createPendingEntry).toBeCalled();
        expect(storeMessages).toBeCalled();
        expect(submitMessageApi).not.toBeCalled();
        expect(onSuccess).not.toBeCalled();
    });
    it('builds an envelop and submit the message if the delivery was not halted', async () => {
        const connection = {} as Connection;
        const deliverySerivceToken = '';
        const message: Message = {
            metadata: {
                to: '',
                from: USER_NAME_1,
                timestamp: 123,
                type: 'NEW',
            },
            message: '',
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            deliveryServiceEncryptionPubKey: '',
            keys: await getMockProfileKeys(),
            from: {
                ensName: '',
                profile: {
                    deliveryServices: [],
                    publicEncryptionKey: '',
                    publicSigningKey: '',
                },
            },
            to: {
                ensName: '',
                profile: {
                    deliveryServices: [],
                    publicEncryptionKey: '',
                    publicSigningKey: '',
                },
            },
        };
        const submitMessageApi = jest.fn(
            (
                _: Connection,
                __: string,
                ___: Envelop | EncryptionEnvelop,
                onSuccess: () => void,
                onError: () => void,
            ) => {
                onSuccess();
                return Promise.resolve();
            },
        );
        const encryptAsymmetric = (publicKey: string, payload: string) => {
            return Promise.resolve({
                nonce: '',
                ciphertext: payload,
                ephemPublicKey: '',
            });
        };
        const createPendingEntry = jest.fn();
        const haltDelivery = false;
        const storeMessages = jest.fn();
        const onSuccess = jest.fn();

        await submitMessage(
            connection,
            deliverySerivceToken,
            sendDependencies,
            message,
            submitMessageApi,
            encryptAsymmetric,
            createPendingEntry,
            haltDelivery,
            storeMessages,
            onSuccess,
        );

        expect(createPendingEntry).toBeCalled();
        expect(storeMessages).toBeCalled();
        expect(submitMessageApi).toBeCalled();
        expect(onSuccess).toBeCalled();
    });
});
