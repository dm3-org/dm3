import { ethers } from 'ethers';
import { createProfileKeys } from 'dm3-lib-profile';
import {
    createStorageKey,
    EncryptAsymmetric,
    getStorageKeyCreationMessage,
} from 'dm3-lib-crypto';
import { buildEnvelop } from './Envelop';
import { Message, SendDependencies } from './Message';

const USER_ADDRESS_1 = '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292';

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
describe('Envelope', () => {
    describe('buildEnvelop', () => {
        it('throws an expection if a contract has no profile', async () => {
            const message: Message = {
                metadata: {
                    to: '',
                    from: USER_ADDRESS_1,
                    timestamp: 123,
                    type: 'NEW',
                },
                message: '',
                signature: '',
            };
            const encrpy: EncryptAsymmetric = (
                publicKey: string,
                payload: string,
            ) => {
                return Promise.resolve({
                    nonce: '',
                    ciphertext: payload,
                    ephemPublicKey: '',
                });
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
                },
            };
            expect(async () => {
                await buildEnvelop(message, encrpy, sendDependencies);
            }).rejects.toEqual(Error('Contact has no profile'));
        });
        it('returns an encrypted envelop', async () => {
            const message: Message = {
                metadata: {
                    to: '',
                    from: USER_ADDRESS_1,
                    timestamp: 123,
                    type: 'NEW',
                },
                message: '',
                signature: '',
            };
            const encrpy: EncryptAsymmetric = (
                publicKey: string,
                payload: string,
            ) => {
                return Promise.resolve({
                    nonce: '',
                    ciphertext: payload,
                    ephemPublicKey: '',
                });
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

            const actualEnvelop = await buildEnvelop(
                message,
                encrpy,
                sendDependencies,
            );

            expect(actualEnvelop.envelop).toStrictEqual({
                message: {
                    metadata: {
                        from: '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
                        timestamp: 123,
                        to: '',
                        type: 'NEW',
                    },
                    message: '',
                    signature: '',
                },
                metadata: {
                    encryptionScheme: 'x25519-chacha20-poly1305',
                    deliveryInformation: {
                        from: '',
                        to: '',
                    },
                    encryptedMessageHash:
                        '0xc3428898a18e2cdb914e7eec870e45348c7f401d094968408524b787b43451d0',
                    version: 'v1',
                    signature:
                        'YEk6gtRvjnIqh90iZgUU6t/eUONjFh0EvcYU+Iln6ZwUPr1DaZwzH0M3kA6m8ygJOaCUkSugt9ghevCUNvwcCw==',
                },
            });
        });
    });
});
