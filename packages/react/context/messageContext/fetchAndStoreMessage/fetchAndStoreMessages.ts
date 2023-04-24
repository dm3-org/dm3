import axios from 'axios';
import { fetchNewMessages } from '../../../api/http/messages/fetchNewMessages';
import { Connection } from '../../../src/web3provider/Web3Provider';
import {
    StorageEnvelopContainer,
    UserDB,
    getConversation,
} from 'dm3-lib-storage';
import { Account, getDeliveryServiceProfile } from 'dm3-lib-profile';
import { EncryptionEnvelop, Envelop, MessageState } from 'dm3-lib-messaging';
import { decryptAsymmetric } from 'dm3-lib-crypto';

export async function fetchAndStoreMessages(
    connection: Connection,
    deliveryServiceToken: string,
    contact: string,
    userDb: UserDB,
    storeMessages: (envelops: StorageEnvelopContainer[]) => void,
    contacts: Account[],
): Promise<StorageEnvelopContainer[]> {
    const profile = connection.account?.profile;

    if (!profile) {
        throw Error('Account has no profile');
    }
    //Fetch evey delivery service's profie
    const deliveryServices = await Promise.all(
        profile.deliveryServices.map(async (ds) => {
            const deliveryServiceProfile = await getDeliveryServiceProfile(
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
        allMessages.map(async (envelop): Promise<StorageEnvelopContainer> => {
            const decryptedEnvelop = await decryptMessages([envelop], userDb);

            return {
                envelop: decryptedEnvelop[0],
                messageState: MessageState.Send,
                deliveryServiceIncommingTimestamp:
                    decryptedEnvelop[0].postmark?.incommingTimestamp,
            };
        }),
    );
    //Storing the newly fetched messages in the userDb
    storeMessages(envelops);

    //Return all messages from the conversation between the user and their contact
    return getConversation(contact, contacts, userDb);
}

async function decryptMessages(
    envelops: EncryptionEnvelop[],
    userDb: UserDB,
): Promise<Envelop[]> {
    return Promise.all(
        envelops.map(
            async (envelop): Promise<Envelop> => ({
                message: JSON.parse(
                    await decryptAsymmetric(
                        userDb.keys.encryptionKeyPair,
                        JSON.parse(envelop.message),
                    ),
                ),
                postmark: JSON.parse(
                    await decryptAsymmetric(
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
