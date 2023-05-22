/* eslint-disable max-len */
import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { DeliveryServiceProfile } from 'dm3-lib-profile';
import { getDeliveryServiceWSClient } from '../../../api/internal/ws/getDeliveryServiceWSConnections';
import {
    AuthenticatedBillboard,
    AuthenticatedBillboardWithSocket,
    BillboardWithDsProfile,
} from '../DsManagerImpl';
import { log } from 'dm3-lib-shared';

/**
 * Establishes WebSocket connections for authenticated billboards with delivery service profiles, and returns an array of authenticated billboards with their associated WebSocket clients.
 *
 * @param {AuthenticatedBillboard[]} billboardsWithDsProfile - An array of authenticated billboards with delivery service profiles.
 * @param {(
 *     billboardWithDsProfile: BillboardWithDsProfile,
 *     encryptionEnvelop: EncryptionEnvelop,
 * ) => Promise<void>} encryptAndStoreMessage - A function that takes a billboard with delivery service profile and an encryption envelop as parameters, and returns a promise that resolves when the message has been encrypted and stored.
 * @returns {Promise<AuthenticatedBillboardWithSocket[]>} An array of authenticated billboards with their associated WebSocket clients.
 */

export async function establishWsConnections(
    billboardsWithDsProfile: AuthenticatedBillboard[],
    encryptAndStoreMessage: (
        billboardWithDsProfile: BillboardWithDsProfile,
        encryptionEnvelop: EncryptionEnvelop,
    ) => Promise<void>,
): Promise<AuthenticatedBillboardWithSocket[]> {
    return await Promise.all(
        billboardsWithDsProfile.map(async (billboardWithDsProfile) => {
            log(
                `Establish WS connection for ${billboardWithDsProfile.ensName}`,
            );
            //For each billboard, establish a WebSocket connection with each delivery service profile.

            const sockets = await getDeliveryServiceWSClient(
                billboardWithDsProfile.dsProfile,
                (encryptionEnvelop: EncryptionEnvelop) =>
                    encryptAndStoreMessage(
                        billboardWithDsProfile,
                        encryptionEnvelop,
                    ),
                billboardWithDsProfile.ensName,
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
