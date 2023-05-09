import { createDeliveryServiceProfile, createProfile } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { createJsonDataUri } from 'dm3-lib-shared';
import {
    EncryptionEnvelop,
    createEnvelop,
    createJsonRpcCallSubmitMessage,
    createMessage,
    JsonRpcRequest,
    handleMessageOnDeliveryService,
    decryptEnvelop,
    checkMessageSignature,
} from 'dm3-lib-messaging';

describe('Profile creation and sending a message', () => {
    let provider: ethers.providers.JsonRpcProvider;
    let aliceWallet: ethers.Wallet;
    let bobWallet: ethers.Wallet;
    let signer: Record<string, ethers.Wallet>;
    let textRecordMockReg: Record<string, Record<string, string>>;
    let httpPostRequests: Record<string, JsonRpcRequest<EncryptionEnvelop>[]>;
    let pushReg: Record<string, (envelop: EncryptionEnvelop) => Promise<void>>;

    const textRecordPublishMock = (
        ensName: string,
        recordName: string,
        text: string,
    ) => {
        if (!textRecordMockReg[ensName]) {
            textRecordMockReg[ensName] = {};
        }
        textRecordMockReg[ensName][recordName] = text;
    };

    const httpServerPostMock = (
        url: string,
        body: JsonRpcRequest<EncryptionEnvelop>,
    ) => {
        if (!httpPostRequests[url]) {
            httpPostRequests[url] = [];
        }

        httpPostRequests[url].push(body);
    };

    const getMessagesMock = (url: string) => {
        return httpPostRequests[url].map((req) => req.params[0]);
    };

    const onMessageReg = (
        ensName: string,
        cb: (envelop: EncryptionEnvelop) => Promise<void>,
    ) => {
        pushReg[ensName] = cb;
    };

    const pushMessage = (ensName: string, envelop: EncryptionEnvelop) => {
        pushReg[ensName](envelop);
    };

    beforeEach(() => {
        pushReg = {};
        textRecordMockReg = {};
        httpPostRequests = {};
        aliceWallet = new ethers.Wallet(
            '0x6213babbc500db267990a92da63a375350f942705d00a4509b7eb6ce88005bb7',
        );

        bobWallet = new ethers.Wallet(
            '0xb71d06f166a1fde4b7158b26c4d8940dfb2b7510808fd1d21157831b67286ed1',
        );

        signer = {};
        signer[aliceWallet.address] = aliceWallet;
        signer[bobWallet.address] = bobWallet;

        const nameMapping: Record<string, string> = {
            'alice.eth': aliceWallet.address,
            'bob.eth': bobWallet.address,
        };

        const newProvider = new ethers.providers.JsonRpcProvider(
            'http://localhost',
        );
        provider = {
            ...newProvider,
            send: (methode: string, params: any[]) => {
                if (methode === 'personal_sign') {
                    const wallet = signer[params[1]];
                    if (!wallet) {
                        throw Error('Unknown signer');
                    }
                    return wallet.signMessage(params[0]);
                } else {
                    return provider.send(methode, params);
                }
            },
            resolveName: async (name: string) => {
                return nameMapping[name];
            },
            getResolver: ((name: string) =>
                textRecordMockReg[name]
                    ? {
                          getText: async (recordName: string) =>
                              textRecordMockReg[name][recordName],
                      }
                    : null) as any,
        } as ethers.providers.JsonRpcProvider;
    });

    it('should send a message from Alice to Bob', async () => {
        expect.assertions(2);

        // Function to get HTTP Ressoucres, only needed for IPFS or HTTP profiles (deprecated)
        // Use CCIP instead of IPFS or HTTP profiles
        const getRessource = async (uri: string) => null as any;

        // ------
        //
        // Delivery services setup
        //
        // ------

        // The following function calls returns the profile and the keys
        // and the nonce for delivery services A and B
        // 'http://a' and 'http://b' are the URLs pointing to the delivery service endpoint
        const {
            deliveryServiceProfile: deliveryServiceProfileA,
            keys: dsKeysA,
        } = await createDeliveryServiceProfile('http://a');

        const {
            deliveryServiceProfile: deliveryServiceProfileB,
            keys: dsKeysB,
        } = await createDeliveryServiceProfile('http://b');

        // The delivery service profiles need to be transformed into a data URI
        // before they can be published on-chain
        const profileJsonDataUriA = createJsonDataUri(deliveryServiceProfileA);
        const profileJsonDataUriB = createJsonDataUri(deliveryServiceProfileB);

        // The profiles must be published on-chain as ENS 'network.dm3.deliveryService' text record.
        // In this case, a text record mock is used instead of setting
        // the actual 'network.dm3.deliveryService' text record of a.eth and b.eth
        textRecordPublishMock(
            'a.eth',
            'network.dm3.deliveryService',
            profileJsonDataUriA,
        );

        textRecordPublishMock(
            'b.eth',
            'network.dm3.deliveryService',
            profileJsonDataUriB,
        );

        // ------
        //
        // Creating and publishing user profiles
        //
        // ------

        // Every dm3 user needs to create and publish a profile containing:
        // - the public signing key,
        // - the public encryption key,
        // - and a list of the ENS names referencing the delivery service the user subscribed to
        // The following function calls will return the user profile, the keys, and the nonce.
        const {
            signedProfile: aliceProfile,
            keys: aliceKeys,
            nonce: aliceNonce,
        } = await createProfile(aliceWallet.address, ['a.eth'], provider);

        const {
            signedProfile: bobProfile,
            keys: bobKeys,
            nonce: bobNonce,
        } = await createProfile(bobWallet.address, ['b.eth'], provider);

        // The user profiles need to be transformed into a data URI
        // before they can be published on-chain
        const profileJsonDataUriAlice = createJsonDataUri(aliceProfile);
        const profileJsonDataUriBob = createJsonDataUri(bobProfile);

        // The profiles must be published on-chain or made available via CCIP.
        // Therefore the ENS 'network.dm3.profile' text record needs to be set to the data URI
        // containing the user profile.
        // In this case a text record mock is used instead of setting
        // the actual 'network.dm3.deliveryService' text record of alice.eth and bob.eth

        textRecordPublishMock(
            'alice.eth',
            'network.dm3.profile',
            profileJsonDataUriAlice,
        );

        textRecordPublishMock(
            'bob.eth',
            'network.dm3.profile',
            profileJsonDataUriBob,
        );

        // ------
        //
        // Sending and receiving messages
        // [ Sender Client ] -> Receiver Delivery Service -> Receiver Client
        //
        // ------

        // To receive messages the dm3 clients can subscribe to a "new message" event
        // via a WebSocket that is provided by the delivery service.
        // The messages could also be fetched via a REST request.
        // In this example Alice and Bob subscribe to a mocked push service
        onMessageReg('alice.eth', async (envelop: EncryptionEnvelop) => {});

        onMessageReg('bob.eth', async (encryptedEnvelop: EncryptionEnvelop) => {
            // ------
            //
            // Message Processing on the receiver client
            // Sender Client -> Receiver Delivery Service -> [ Receiver Client ]
            //
            // ------

            // The client will decrypt a received message
            const envelop = await decryptEnvelop(
                encryptedEnvelop,
                bobKeys.encryptionKeyPair,
            );

            expect(envelop.message.message).toStrictEqual('Test message');

            // The client must check the signature of a received message
            const validMessage = await checkMessageSignature(
                envelop.message,
                aliceProfile.profile.publicSigningKey,
                'alice.eth',
            );

            expect(validMessage).toStrictEqual(true);
        });

        // The following lines will create a message with the content 'Test Message'
        const messageAliceToBob = await createMessage(
            'bob.eth',
            'alice.eth',
            'Test message',
            aliceKeys.signingKeyPair.privateKey,
        );

        // The message must be encrypted and put into an envelope containing
        // meta information needed for the delivery
        // The createEnvelop function will return an encrypted and unencrypted version of the envelope.
        // The unencrypted version could be used for storing it
        // with a chunk of other received and send messages in a message store.
        // The message store could be encrypted with the generated symmetrical key.
        const {
            encryptedEnvelop: encyptedEnvelopAliceToBob,
            envelop: envelopAliceToBob,
            sendDependencies,
        } = await createEnvelop(
            messageAliceToBob,
            provider,
            aliceKeys,
            getRessource,
        );

        // The following function returns then JSON RPC Request
        const jsonRpcRequest = createJsonRpcCallSubmitMessage(
            encyptedEnvelopAliceToBob,
        );

        // Here the message is submitted to the delivery service.
        httpServerPostMock(
            sendDependencies.deliverServiceProfile.url,
            jsonRpcRequest,
        );

        // ------
        //
        // Message Processing on the deliavery service
        // Sender Client -> [ Receiver Delivery Service ] -> Receiver Client
        //
        // ------

        const messagesOnDeliveryService = getMessagesMock(
            deliveryServiceProfileB.url,
        );

        // handleMessageOnDeliveryService() will decrypt the delivery information
        // and add a postmark (incoming timestamp) to the envelop
        const processedMessages = await Promise.all(
            messagesOnDeliveryService.map(
                async (encryptedEnvelop) =>
                    await handleMessageOnDeliveryService(
                        encryptedEnvelop,
                        dsKeysB,
                        bobProfile.profile,
                    ),
            ),
        );

        // After processing the envelope, the delivery service forwards the message to the receiver
        processedMessages.forEach((envelopContainer) =>
            pushMessage(
                envelopContainer.decryptedDeliveryInformation.to,
                envelopContainer.encryptedEnvelop,
            ),
        );
    });
});
