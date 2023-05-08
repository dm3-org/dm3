import { log } from 'dm3-lib-shared';
import { getIncomingMessages } from '../../../api/internal/rest/getIncomingMessages';
import { AuthenticatedBillboard, BillboardWithDsProfile } from '../DsConnector';
import { EncryptionEnvelop } from 'dm3-lib-messaging';

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
                billboard.dsProfile.map(async (ds) => {
                    const messages = await getIncomingMessages(
                        ds.url,
                        billboard.ensName,
                    );
                    if (!messages) {
                        log('cant fetch initial messages for ds ' + ds.url);
                        return;
                    }
                    log(
                        `Got ${messages?.length} for ${billboard.ensName} from ${ds.url}`,
                    );
                    await Promise.all(
                        messages.map((m) =>
                            encryptAndStoreMessage(billboard, m),
                        ),
                    );
                }),
            );
        }),
    );
}
