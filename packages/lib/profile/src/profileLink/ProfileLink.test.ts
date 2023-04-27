import { ethers } from 'ethers';
import {
    createProfileLink,
    signProfileLink,
    verifyProfileLink,
} from './ProfileLink';
import { sign } from 'dm3-lib-crypto';

const signMessage =
    'dm3 Profile Link:\n' +
    'chat.dm3 wants you to link your local dm3 profile with your main dm3 profile.\n\n' +
    'Main ID: dm3.eth\n' +
    'Main ID Type: ProfileLink\n' +
    'Linked Profile Name: embedded.dm3.eth\n' +
    'Nonce: 0\n' +
    'Issued At: 1\n' +
    'Expiration Time: null';

describe('ProfileLink', () => {
    describe('createProfileLink', () => {
        it('should create a correct profile link between a main profile and a scope profile', async () => {
            expect({
                ...createProfileLink('dm3.eth', 'embedded.dm3.eth', 'chat.dm3'),
                issuedAt: null,
            }).toStrictEqual({
                type: 'ProfileLink',
                mainId: 'dm3.eth',
                linkedProfile: 'embedded.dm3.eth',
                scopeUri: 'chat.dm3',
                issuedAt: null,
                expirationTime: null,
                nonce: 0,
            });
        });
        it('should create a correct profile link between a eth address and a scope profile', async () => {
            expect({
                ...createProfileLink(
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
                    'embedded.dm3.eth',
                    'chat.dm3',
                ),
                issuedAt: null,
            }).toStrictEqual({
                type: 'EthAddressLink',
                mainId: '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
                linkedProfile: 'embedded.dm3.eth',
                scopeUri: 'chat.dm3',
                issuedAt: null,
                expirationTime: null,
                nonce: 0,
            });
        });
        it('should use the options correctly', async () => {
            expect({
                ...createProfileLink(
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
                    'embedded.dm3.eth',
                    'chat.dm3',
                    { nonce: 111 },
                ),
                issuedAt: null,
            }).toStrictEqual({
                type: 'EthAddressLink',
                mainId: '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
                linkedProfile: 'embedded.dm3.eth',
                scopeUri: 'chat.dm3',
                issuedAt: null,
                expirationTime: null,
                nonce: 111,
            });
        });
    });
    describe('signProfileLink', () => {
        it('should create a correct sign message', async () => {
            expect.assertions(1);
            await signProfileLink(
                {
                    type: 'ProfileLink',
                    mainId: 'dm3.eth',
                    linkedProfile: 'embedded.dm3.eth',
                    scopeUri: 'chat.dm3',
                    issuedAt: 1,
                    expirationTime: null,
                    nonce: 0,
                },
                async (msg) => {
                    expect(msg).toStrictEqual(signMessage);
                    return '';
                },
            );
        });

        it('should sign correctly', async () => {
            expect(
                await signProfileLink(
                    {
                        type: 'ProfileLink',
                        mainId: 'dm3.eth',
                        linkedProfile: 'embedded.dm3.eth',
                        scopeUri: 'chat.dm3',
                        issuedAt: 1,
                        expirationTime: null,
                        nonce: 0,
                    },

                    async (msg) =>
                        sign(
                            'fxIyJnMWNyzEma5dTFIgFEHbMhOcUZ1iq6pQN12r4cnuetAM8Rj+7io58EmfWSmV/KCWVfZW/UB9SjYAy4Ljkw==',
                            msg,
                        ),
                ),
            ).toStrictEqual({
                profileLink: {
                    type: 'ProfileLink',
                    mainId: 'dm3.eth',
                    linkedProfile: 'embedded.dm3.eth',
                    scopeUri: 'chat.dm3',
                    issuedAt: 1,
                    expirationTime: null,
                    nonce: 0,
                },
                signature:
                    'P70WQUQ0yKDulk2uQ10bHJZdcMm4A4Q+2tGsQcggPle6nF/KuwY8J2YW4b3KSR5jOIx2fNW1SADD7Y469vZUCQ==',
            });
        });

        it('should eth personal sign correctly', async () => {
            const wallet = new ethers.Wallet(
                '0xce9aa67cd2a9d3c83ba1425d4ea06187e90c20c1f2fca94e1e9c588ef55ceee0',
            );

            expect(
                await signProfileLink(
                    {
                        type: 'EthAddressLink',
                        mainId: '0x73A369A2f0DeeD3D4381970D52bFcDdcEFEe9a26',
                        linkedProfile: 'embedded.dm3.eth',
                        scopeUri: 'chat.dm3',
                        issuedAt: 1,
                        expirationTime: null,
                        nonce: 0,
                    },

                    async (msg) => wallet.signMessage(msg),
                ),
            ).toStrictEqual({
                profileLink: {
                    type: 'EthAddressLink',
                    mainId: '0x73A369A2f0DeeD3D4381970D52bFcDdcEFEe9a26',
                    linkedProfile: 'embedded.dm3.eth',
                    scopeUri: 'chat.dm3',
                    issuedAt: 1,
                    expirationTime: null,
                    nonce: 0,
                },
                signature:
                    '0x0a88b1fba049a64b07a0f1cd508b9bda0ed17b1d289aabdd43ef9927ab48cd' +
                    'fd79a00b0159693d194b7a7b4a222388cfe56f9be43ebe9666ecaea8afeda182aa1c',
            });
        });
    });

    describe('verifyProfileLink', () => {
        it('should verify correctly', async () => {
            expect(
                await verifyProfileLink(
                    {
                        profileLink: {
                            type: 'ProfileLink',
                            mainId: 'dm3.eth',
                            linkedProfile: 'embedded.dm3.eth',
                            scopeUri: 'chat.dm3',
                            issuedAt: 1,
                            expirationTime: null,
                            nonce: 0,
                        },
                        signature:
                            'P70WQUQ0yKDulk2uQ10bHJZdcMm4A4Q+2tGsQcggPle6nF/KuwY8J2YW4b3KSR5jOIx2fNW1SADD7Y469vZUCQ==',
                    },

                    '7nrQDPEY/u4qOfBJn1kplfygllX2Vv1AfUo2AMuC45M=',
                ),
            ).toStrictEqual(true);
        });

        it('should reject an invalid signature', async () => {
            expect(
                await verifyProfileLink(
                    {
                        profileLink: {
                            type: 'ProfileLink',
                            mainId: 'dm3.eth',
                            linkedProfile: 'embedded.dm3.eth',
                            scopeUri: 'chat.dm3',
                            issuedAt: 1,
                            expirationTime: null,
                            nonce: 1,
                        },
                        signature:
                            'P70WQUQ0yKDulk2uQ10bHJZdcMm4A4Q+2tGsQcggPle6nF/KuwY8J2YW4b3KSR5jOIx2fNW1SADD7Y469vZUCQ==',
                    },
                    '7nrQDPEY/u4qOfBJn1kplfygllX2Vv1AfUo2AMuC45M=',
                ),
            ).toStrictEqual(false);
        });

        it('should verify a personal signed profile link correctly', async () => {
            expect(
                await verifyProfileLink({
                    profileLink: {
                        type: 'EthAddressLink',
                        mainId: '0x73A369A2f0DeeD3D4381970D52bFcDdcEFEe9a26',
                        linkedProfile: 'embedded.dm3.eth',
                        scopeUri: 'chat.dm3',
                        issuedAt: 1,
                        expirationTime: null,
                        nonce: 0,
                    },
                    signature:
                        '0x0a88b1fba049a64b07a0f1cd508b9bda0ed17b1d289aabdd43ef9927ab48cd' +
                        'fd79a00b0159693d194b7a7b4a222388cfe56f9be43ebe9666ecaea8afeda182aa1c',
                }),
            ).toStrictEqual(true);
        });

        it('should reject an invalid personal signed profile link', async () => {
            expect(
                await verifyProfileLink({
                    profileLink: {
                        type: 'EthAddressLink',
                        mainId: '0x73A369A2f0DeeD3D4381970D52bFcDdcEFEe9a26',
                        linkedProfile: 'embedded.dm3.eth',
                        scopeUri: 'chat.dm3',
                        issuedAt: 10,
                        expirationTime: null,
                        nonce: 0,
                    },
                    signature:
                        '0x0a88b1fba049a64b07a0f1cd508b9bda0ed17b1d289aabdd43ef9927ab48cd' +
                        'fd79a00b0159693d194b7a7b4a222388cfe56f9be43ebe9666ecaea8afeda182aa1c',
                }),
            ).toStrictEqual(false);
        });
    });
});
