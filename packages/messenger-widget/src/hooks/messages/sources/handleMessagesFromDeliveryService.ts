import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    EncryptionEnvelop,
    Envelop,
    MessageState,
} from '@dm3-org/dm3-lib-messaging';
import { MessageModel } from '../useMessage';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { StoreMessageBatch } from '../../storage/useStorage';
import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';

export const handleMessagesFromDeliveryService = async (
    account: Account,
    profileKeys: ProfileKeys,
    storeMessageBatch: StoreMessageBatch,
    contact: string,
    fetchNewMessages: (ensName: string, contactAddress: string) => any,
    syncAcknowledgment: (
        ensName: string,
        acknoledgments: Acknoledgment[],
        lastSyncTime: number,
    ) => void,
) => {
    const lastSyncTime = Date.now();
    //Fetch the pending messages from the delivery service
    const encryptedIncommingMessages = await fetchNewMessages(
        account.ensName,
        contact,
    );

    const incommingMessages: MessageModel[] = await Promise.all(
        encryptedIncommingMessages.map(async (envelop: EncryptionEnvelop) => {
            const decryptedEnvelop: Envelop = {
                message: JSON.parse(
                    await decryptAsymmetric(
                        profileKeys?.encryptionKeyPair!,
                        JSON.parse(envelop.message),
                    ),
                ),
                postmark: JSON.parse(
                    await decryptAsymmetric(
                        profileKeys?.encryptionKeyPair!,
                        JSON.parse(envelop.postmark!),
                    ),
                ),
                metadata: envelop.metadata,
            };
            return {
                envelop: decryptedEnvelop,
                //Messages from the delivery service are already send by the sender
                messageState: MessageState.Send,
                messageChunkKey: '',
                reactions: [],
            };
        }),
    );

    const messagesSortedASC = incommingMessages.sort((a, b) => {
        return (
            a.envelop.postmark?.incommingTimestamp! -
            b.envelop.postmark?.incommingTimestamp!
        );
    });

    //In the background we sync and acknowledge the messages and store then in the storage
    await storeMessageBatch(contact, messagesSortedASC);

    await syncAcknowledgment(
        account.ensName,
        [
            {
                contactAddress: contact,
                //This value is not used in the backend hence we can set it to 0
                messageDeliveryServiceTimestamp: 0,
            },
        ],
        lastSyncTime,
    );
    return messagesSortedASC;
};
