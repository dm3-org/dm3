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
import { log } from 'dm3-lib-shared';

interface Billboard {
    ensName: string;
    privateKey: string;
}

type BillboardWithProfile = Billboard & SignedUserProfile;
type BillboardWithDsProfile = BillboardWithProfile & {
    dsProfile: DeliveryServiceProfile[];
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

    //For each billboard and their delivryServices we establish a websocket connection
    await establishWsConnections(billboardsWithDsProfile);

    //For each delivery service profile we've to exercise the login flow

    async function getBillboardProfile() {
        return await Promise.all(
            billboards.map(async (billboard) => {
                log('Get User profile for ' + billboard.ensName);
                const billboardProfile = await getUserProfile(
                    provider,
                    billboard.ensName,
                );

                if (!billboardProfile) {
                    throw Error(
                        "Can't get billboard  profile for " + billboard.ensName,
                    );
                }
                billboardProfile.profile.deliveryServices;
                return { ...billboard, ...billboardProfile, dsProfile: [] };
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
}
