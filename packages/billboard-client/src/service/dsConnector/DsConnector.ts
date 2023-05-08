import { EncryptionEnvelop, Message, Postmark } from 'dm3-lib-messaging';
import {
    DeliveryServiceProfile,
    ProfileKeys,
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
    decryptAsymmetric,
    getStorageKeyCreationMessage,
    sign,
} from 'dm3-lib-crypto';

interface Billboard {
    ensName: string;
    privateKey: string;
}

type BillboardWithProfile = Billboard &
    SignedUserProfile & { profileKeys: ProfileKeys };
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
        const billboardsWithProfile = await getBillboardProfile();

        //Get all delivery service profiles
        const billboardsWithDsProfile = await Promise.all(
            billboardsWithProfile.map(getDsProfile),
        );
        //For each delivery service profile we've to exercise the login flow
        const authenticatedBillboards = await signInAtDs(
            billboardsWithDsProfile,
        );

        //For each billboard and their delivryServices we establish a websocket connection
        _connectedBillboards = await establishWsConnections(
            authenticatedBillboards,
        );
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
                const wallet = new ethers.Wallet(billboard.privateKey);

                const storageKeyCreationMessage =
                    getStorageKeyCreationMessage(0);
                const storageKeySig = await wallet.signMessage(
                    storageKeyCreationMessage,
                );

                const storageKey = await createStorageKey(storageKeySig);
                //TODO Do thosse keys have to match the ones provvied with the profile
                const profileKeys = await createProfileKeys(storageKey, 0);
                try {
                    const billboardProfile = await getUserProfile(
                        provider,
                        billboard.ensName,
                    );
                    return {
                        ...billboard,
                        ...billboardProfile!,
                        profileKeys,
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
                const { ensName, profileKeys, dsProfile } = billboard;
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
                            profileKeys.signingKeyPair.privateKey,
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
                    (encryptionEnvelop: EncryptionEnvelop) =>
                        encryptAndStoreMessage(
                            billboardWithDsProfile,
                            encryptionEnvelop,
                        ),
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

    async function encryptAndStoreMessage(
        billboardWithDsProfile: BillboardWithDsProfile,
        encryptionEnvelop: EncryptionEnvelop,
    ) {
        try {
            const decryptedMessage = JSON.parse(
                await decryptAsymmetric(
                    billboardWithDsProfile.profileKeys.encryptionKeyPair,
                    JSON.parse(encryptionEnvelop.message),
                ),
            ) as Message;
            await db.createMessage(
                billboardWithDsProfile.ensName,
                decryptedMessage,
            );
        } catch (err: any) {
            log("Can't decrypt message");
            log(err);
        }
    }

    //TODO Heiko please double check if this is the correct way to sign the challenge of the delivery service
    async function _signChallenge(challenge: string, privateKey: string) {
        return await sign(privateKey, challenge);
    }

    return { connect, disconnect };
}
