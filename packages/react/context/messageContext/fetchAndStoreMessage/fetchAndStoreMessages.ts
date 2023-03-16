import axios from 'axios';
import * as Lib from 'dm3-lib';
import { fetchNewMessages } from '../../../api/http/messages/fetchNewMessages';

export async function fetchAndStoreMessages(
    connection: Lib.Connection,
    deliveryServiceToken: string,
    contact: string,
    userDb: Lib.storage.UserDB,
    storeMessages: (envelops: Lib.storage.StorageEnvelopContainer[]) => void,
): Promise<Lib.storage.StorageEnvelopContainer[]> {
    const profile = connection.account?.profile;

    if (!profile) {
        throw Error('Account has no profile');
    }
    //Fetch evey delivery service's profie
    const deliveryServices = await Promise.all(
        profile.deliveryServices.map(async (ds) => {
            const deliveryServiceProfile =
                await Lib.account.getDeliveryServiceProfile(
                    ds,
                    connection.provider!,
                    async (url) => (await axios.get(url)).data,
                );
            return deliveryServiceProfile?.url;
        }),
    );

    //Filter every deliveryService without an url
    const deliveryServiceUrls = deliveryServices.filter(
        (ds): ds is string => !!ds,
    );

    //Fetch messages from each deliveryService
    const messages = await Promise.all(
        deliveryServiceUrls.map(async (baseUrl) => {
            return await fetchNewMessages(
                connection,
                deliveryServiceToken,
                contact,
                baseUrl,
            );
        }),
    );

    //Flatten the message arrays of each delivery service to one message array
    const allMessages = messages.reduce((agg, cur) => [...agg, ...cur], []);

    const envelops = await Promise.all(
        /**
         * Decrypts every message using the receivers encryptionKey
         */
        allMessages.map(
            async (envelop): Promise<Lib.storage.StorageEnvelopContainer> => {
                const decryptedEnvelop = await decryptMessages(
                    [envelop],
                    userDb,
                );

                return {
                    envelop: decryptedEnvelop[0],
                    messageState: Lib.messaging.MessageState.Send,
                    deliveryServiceIncommingTimestamp:
                        decryptedEnvelop[0].postmark?.incommingTimestamp,
                };
            },
        ),
    );
    //Storing the newly fetched messages in the userDb
    storeMessages(envelops);

    //Return all messages from the conversation between the user and their contact
    return Lib.storage.getConversation(contact, userDb);
}

async function decryptMessages(
    envelops: Lib.messaging.EncryptionEnvelop[],
    userDb: Lib.storage.UserDB,
): Promise<Lib.messaging.Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Lib.messaging.Envelop> => ({
                message: JSON.parse(
                    await Lib.crypto.decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.message),
                    ),
                ),
                postmark: JSON.parse(
                    await Lib.crypto.decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.postmark!),
                    ),
                ),
                metadata: envelop.metadata,
            }),
        ),
    );
}

export type FetchAndStoreMessages = typeof fetchAndStoreMessages;
