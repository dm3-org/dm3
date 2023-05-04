import { EncryptionEnvelop } from 'dm3-lib-messaging';
import {
    DeliveryServiceProfile,
    SignedUserProfile,
    createProfileKeys,
    getDeliveryServiceProfile,
    getUserProfile,
} from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import { Socket } from 'socket.io-client';
import { getChallenge } from '../../api/internal/rest/getChallenge';
import { getNewToken } from '../../api/internal/rest/getNewToken';
import { getDeliveryServiceWSClient } from '../../api/internal/ws/getDeliveryServiceWSConnections';
import { IDatabase } from '../../persitance/getDatabase';
import {
    createStorageKey,
    getStorageKeyCreationMessage,
    sign,
} from 'dm3-lib-crypto';

interface Billboard {
    ensName: string;
    privateKey: string;
}

type BillboardWithProfile = Billboard & SignedUserProfile;
type BillboardWithDsProfile = BillboardWithProfile & {
    dsProfile: DeliveryServiceProfile[];
};
type AuthenticatedBillboard = BillboardWithDsProfile & {
    dsProfile: (DeliveryServiceProfile & { token: string })[];
};
type AuthenticatedBillboardWithSocket = AuthenticatedBillboard & {
    dsProfile: (DeliveryServiceProfile & {
        token: string;
        socket: Socket;
    })[];
};

export function dsConnector(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
) {
    let _connectedBillboards: AuthenticatedBillboardWithSocket[] = [];

    async function connect() {
        //Get all delivery service profiles
        const billboardsWithProfile: BillboardWithProfile[] =
            await getBillboardProfile();

        //Get all delivery service profiles
        const billboardsWithDsProfile = await Promise.all(
            billboardsWithProfile.map(getDsProfile),
        );
        //For each delivery service profile we've to exercise the login flow
        const authenticatedBillboards = await signInAtDs(
            billboardsWithDsProfile,
        );

        _connectedBillboards = await establishWsConnections(
            authenticatedBillboards,
        );

        //For each billboard and their delivryServices we establish a websocket connection
        // await establishWsConnections(billboardsWithDsProfile);
    }

    function disconnect() {
        _connectedBillboards.forEach((billboard) => {
            billboard.dsProfile.forEach(
                (ds: DeliveryServiceProfile & { socket: Socket }) => {
                    ds.socket.close();
                },
            );
        });
    }

    async function getBillboardProfile() {
        return await Promise.all(
            billboards.map(async (billboard) => {
                log('Get User profile for ' + billboard.ensName);
                try {
                    const billboardProfile = await getUserProfile(
                        provider,
                        billboard.ensName,
                    );
                    return {
                        ...billboard,
                        ...billboardProfile!,
                        dsProfile: [],
                    };
                } catch (e: any) {
                    log(e);
                    throw Error(
                        "Can't get billboard profile for " + billboard.ensName,
                    );
                }
            }),
        );
    }

    //The returnType of getBillboardsProfile
    //is Promise<Billboards & SignedUserProfile>
    async function getDsProfile(billboardsWithProfile: BillboardWithProfile) {
        const dsProfiles = await Promise.all(
            billboardsWithProfile.profile.deliveryServices.map(
                async (url: string) => {
                    log('Get DS profile for ' + url);
                    const dsProfile = await getDeliveryServiceProfile(
                        url,
                        provider,
                        (url: string) => Promise.resolve(undefined),
                    );

                    if (!dsProfile) {
                        throw Error(
                            "Can't get delivery service profile for " + url,
                        );
                    }
                    return dsProfile;
                },
            ),
        );
        return { ...billboardsWithProfile, dsProfile: dsProfiles };
    }
    async function signInAtDs(
        billboardsWithDsProfile: BillboardWithDsProfile[],
    ): Promise<AuthenticatedBillboard[]> {
        return await Promise.all(
            billboardsWithDsProfile.map(async (billboard) => {
                const { ensName, privateKey, dsProfile } = billboard;
                //Get the auth token for each delivery service. By doing the challenge using the billboards private key
                const tokens = await Promise.all(
                    dsProfile.map(async (ds) => {
                        //Create session using the billboards private key
                        const challenge = await getChallenge(ds.url, ensName);
                        if (!challenge) {
                            throw Error('No challenge received from ' + ds.url);
                        }

                        const signature = await _signChallenge(
                            challenge,
                            privateKey,
                        );

                        const token = await getNewToken(
                            ds.url,
                            ensName,
                            signature,
                        );
                        log('get token for ' + ds.url);
                        if (!token) {
                            throw Error("Can't create session for " + ds.url);
                        }
                        return token;
                    }),
                );
                return {
                    ...billboard,
                    dsProfile: tokens.map((token, idx) => ({
                        ...billboard.dsProfile[idx],
                        token,
                    })),
                };
            }),
        );
    }

    async function establishWsConnections(
        billboardsWithDsProfile: AuthenticatedBillboard[],
    ): Promise<AuthenticatedBillboardWithSocket[]> {
        return await Promise.all(
            billboardsWithDsProfile.map(async (billboardWithDsProfile) => {
                const sockets = await getDeliveryServiceWSClient(
                    billboardWithDsProfile.dsProfile.map(
                        (ds: DeliveryServiceProfile) => ds.url,
                    ),
                    encryptAndStoreMessage,
                );

                return {
                    ...billboardWithDsProfile,
                    dsProfile: billboardWithDsProfile.dsProfile.map(
                        (
                            dsProfile: DeliveryServiceProfile & {
                                token: string;
                            },
                            idx,
                        ) => ({
                            ...dsProfile,
                            socket: sockets[idx],
                        }),
                    ),
                };
            }),
        );
    }

    function encryptAndStoreMessage(message: EncryptionEnvelop) {}

    async function establishWsConnection() {}

    //TODO Heiko please double check if this is the correct way to sign the challenge of the delivery service
    async function _signChallenge(challenge: string, privateKey: string) {
        const wallet = new ethers.Wallet(privateKey);

        const storageKeyCreationMessage = getStorageKeyCreationMessage(0);
        const storageKeySig = await wallet.signMessage(
            storageKeyCreationMessage,
        );

        const storageKey = await createStorageKey(storageKeySig);
        const profileKeys = await createProfileKeys(storageKey, 0);

        return await sign(profileKeys.signingKeyPair.privateKey, challenge);
    }

    return { connect, disconnect };
}
