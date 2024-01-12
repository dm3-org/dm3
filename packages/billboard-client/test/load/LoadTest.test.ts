import { Message } from '@dm3-org/dm3-lib-messaging';
import { claimAddress } from '@dm3-org/dm3-lib-offchain-resolver-api';
import {
    ProfileKeys,
    createProfile,
    getDeliveryServiceProfile,
    getUserProfile,
} from '@dm3-org/dm3-lib-profile';
import { logInfo } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { loremIpsum } from 'lorem-ipsum';
import { io } from 'socket.io-client';
import { MockMessageFactory } from '../helper/mockMessageFactory';
import { wait } from '../helper/utils/wait';
import { DeliveryServiceClient } from './DeliveryServiceClient';

const DELIVERY_SERVICE_NAME = 'ethprague-ds.dm3.eth';
const OFFCHAIN_RESOLVER_URL = 'https://billboard-ethprague.herokuapp.com';
const BILLBOARD_CLIENT_URL =
    'https://billboard-ethprague-client.herokuapp.com/';
const BILLBOARD_CLIENT_ENS_NAMES = [
    'billboard1.billboard.ethprague.dm3.eth',
    'billboard2.billboard.ethprague.dm3.eth',
];

const MESSENGES_PER_SECOND = 20;
//Duration in seconds
const DURATION = 20 * 60;

describe('Load test', () => {
    it('Sends 1000 messages per second to the billboard client', async () => {
        const rpcUrl = process.env.RPC_URL || '';

        if (!rpcUrl) {
            throw new Error('RPC url not provided');
        }
        const web3Provider = new ethers.providers.JsonRpcProvider(rpcUrl);

        const deliverServiceProfile = await getDeliveryServiceProfile(
            DELIVERY_SERVICE_NAME,
            web3Provider,
            () => Promise.resolve(undefined),
        );

        if (!deliverServiceProfile) {
            throw (
                "Can't get delivery service profile for " +
                DELIVERY_SERVICE_NAME
            );
        }

        //We need to create a new wallet hot wallet for the user
        const wallet = ethers.Wallet.createRandom();
        //Create new profile at the DS
        const senderProfile = await createProfile(
            wallet.address,
            [DELIVERY_SERVICE_NAME],
            web3Provider,
            {
                signer: (msg: string) => wallet.signMessage(msg),
            },
        );
        //Before we can claim a subdomain we've to claim an address first
        await claimAddress(
            wallet.address,
            OFFCHAIN_RESOLVER_URL,
            senderProfile.signedProfile,
        );
        const ensName = `${wallet.address}.addr.ethprague.dm3.eth`;
        const token = await DeliveryServiceClient(
            deliverServiceProfile.url,
        ).submitUserProfile(ensName, senderProfile.signedProfile);

        if (!token) {
            throw new Error('Can not get token');
        }

        // eslint-disable-next-line max-len
        const profiles = await Promise.all(
            BILLBOARD_CLIENT_ENS_NAMES.map((ensName) =>
                getUserProfile(web3Provider, ensName),
            ),
        );

        const messageFactories = profiles.map((profile, idx) => {
            if (!profile) {
                throw new Error('Profile not found');
            }
            return MockMessageFactory({
                sender: {
                    ensName: ensName,
                    signedUserProfile: senderProfile.signedProfile,
                    profileKeys: senderProfile.keys,
                },
                receiver: {
                    ensName: BILLBOARD_CLIENT_ENS_NAMES[idx],
                    signedUserProfile: profile!,
                    profileKeys: {} as ProfileKeys,
                },
                dsProfile: deliverServiceProfile,
            });
        });

        const receivedMessages: Message[] = [];
        //Add websocket listner to ensure that the messages are received
        BILLBOARD_CLIENT_ENS_NAMES.forEach((billboardId) => {
            io(BILLBOARD_CLIENT_URL).on(`message-${billboardId}`, (message) => {
                receivedMessages.push(message);
            });
        });

        //Submit the messages
        let secondsRunning = 0;
        const passed = await new Promise((resolve) => {
            const interval = setInterval(async () => {
                logInfo('Starting load test');
                if (secondsRunning >= DURATION) {
                    //We're done
                    clearInterval(interval);
                    //Wait for the messages to be received
                    await wait(5000);
                    logInfo('Received ' + receivedMessages.length);

                    const allMeessagesReceived =
                        receivedMessages.length ===
                        DURATION * MESSENGES_PER_SECOND;
                    resolve(allMeessagesReceived);
                }

                secondsRunning++;
                //dispatch messages equally to all message billboards
                const batchSize =
                    MESSENGES_PER_SECOND / messageFactories.length;

                //Create and send messages
                await Promise.all(
                    messageFactories.map(async (factory, idx) => {
                        const messages = await Promise.all(
                            Array.from({ length: batchSize }).map(() =>
                                factory.createMessage(loremIpsum()),
                            ),
                        );
                        logInfo(
                            `Send ${messages.length} messages to ${BILLBOARD_CLIENT_ENS_NAMES[idx]}}`,
                        );

                        messages.forEach((message) => {
                            return DeliveryServiceClient(
                                deliverServiceProfile.url,
                            ).submitMessage(message, token);
                        });
                    }),
                );
            }, 1000);
        });
        expect(passed).toBeTruthy();
    }, 1000000000);
});
