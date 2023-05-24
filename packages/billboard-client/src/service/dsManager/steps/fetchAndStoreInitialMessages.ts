import { log } from 'dm3-lib-shared';
import { getIncomingMessages } from '../../../api/internal/rest/getIncomingMessages';
import {
    AuthenticatedBillboard,
    BillboardWithDsProfile,
} from '../DsManagerImpl';
import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { DeliveryServiceProfile } from 'dm3-lib-profile';

/**
Fetches and stores initial messages for authenticated billboards.
@param authenticatedBillboards - An array of authenticated billboards.
@param encryptAndStoreMessage - A function that encrypts and stores a message.
@returns A promise that resolves when all messages have been fetched and stored.
*/
export async function fetchAndStoreInitialMessages(
    authenticatedBillboards: AuthenticatedBillboard[],
    encryptAndStoreMessage: (
        billboardWithDsProfile: BillboardWithDsProfile,
        encryptionEnvelop: EncryptionEnvelop,
    ) => Promise<void>,
) {
    return await Promise.all(
        authenticatedBillboards.map(async (billboard) => {
            return await Promise.all(
                billboard.dsProfile.map(
                    async (ds: DeliveryServiceProfile & { token: string }) => {
                        log(
                            `Fetch initial messages for ${billboard.ensName} from  ${ds.url}`,
                            'info',
                        );
                        const messages = await getIncomingMessages(
                            ds.url,
                            billboard.ensName,
                            ds.token,
                        );
                        if (!messages) {
                            log(
                                'cant fetch initial messages for ds ' + ds.url,
                                'info',
                            );
                            return;
                        }
                        log(
                            `Got ${messages?.length} for ${billboard.ensName} from ${ds.url}`,
                            'info',
                        );
                        //Encrypt and store each message in the billboardclient's db
                        await Promise.all(
                            messages.map((m) =>
                                encryptAndStoreMessage(billboard, m),
                            ),
                        );
                    },
                ),
            );
        }),
    );
}
