import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { getDeliveryServiceWSClient } from '../../api/internal/ws/getDeliveryServiceWSConnections';
import { IDatabase } from '../../persitance/getDatabase';
import {
    DeliveryServiceProfile,
    SignedUserProfile,
    UserProfile,
    getDeliveryServiceProfile,
    getUserProfile,
} from 'dm3-lib-profile';
import { ethers } from 'ethers';
import { log, stringify } from 'dm3-lib-shared';
import { getNewToken } from '../../api/internal/rest/getNewToken';
import { getChallenge } from '../../api/internal/rest/getChallenge';

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

export async function dsConnector(
    db: IDatabase,
    provider: ethers.providers.JsonRpcProvider,
    billboards: Billboard[],
) {
    //Get all delivery service profiles
    const billboardsWithProfile: BillboardWithProfile[] =
        await getBillboardProfile();

    //Get all delivery service profiles
    const billboardsWithDsProfile = await Promise.all(
        billboardsWithProfile.map(getDsProfile),
    );
    //For each delivery service profile we've to exercise the login flow
    const authenticatedBillboards = await signInAtDs(billboardsWithDsProfile);

    //For each billboard and their delivryServices we establish a websocket connection
    // await establishWsConnections(billboardsWithDsProfile);

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

                        const signature = _signChallenge(challenge, privateKey);

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

    function establishWsConnections(
        billboardsWithDsProfile: BillboardWithDsProfile[],
    ) {
        billboardsWithDsProfile.map((billboardWithDsProfile) => {
            const connections = getDeliveryServiceWSClient(
                billboardWithDsProfile.dsProfile.map(
                    (ds: DeliveryServiceProfile) => ds.url,
                ),
                encryptAndStoreMessage,
            );
        });
    }

    function encryptAndStoreMessage(message: EncryptionEnvelop) {}

    async function establishWsConnection() {}

    function _signChallenge(challenge: string, privateKey: string) {
        //TODO implement
        return '123';
    }
}
