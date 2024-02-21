import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { Envelop, MessageState } from '@dm3-org/dm3-lib-messaging';
import { fetchNewMessages } from '../../../adapters/messages';
import { MessageModel } from '../useMessage';
import { ethers } from 'ethers';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { StoreMessageAsync, StoreMessageBatch } from '../../storage/useStorage';
import { syncAcknowledgment } from '@dm3-org/dm3-lib-delivery-api';

export const handleMessagesFromDeliveryService = async (
    mainnetProvider: ethers.providers.JsonRpcProvider,
    account: Account,
    deliveryServiceToken: string,
    profileKeys: ProfileKeys,
    storeMessageBatch: StoreMessageBatch,
    contact: string,
) => {
    const lastSyncTime = Date.now();
    //Fetch the pending messages from the delivery service
    const encryptedIncommingMessages = await fetchNewMessages(
        mainnetProvider,
        account!,
        deliveryServiceToken!,
        contact,
    );

    const incommingMessages: MessageModel[] = await Promise.all(
        encryptedIncommingMessages.map(async (envelop) => {
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
        mainnetProvider!,
        account!,
        [
            {
                contactAddress: contact,
                //This value is not used in the backend hence we can set it to 0
                messageDeliveryServiceTimestamp: 0,
            },
        ],
        deliveryServiceToken!,
        lastSyncTime,
    );
    return messagesSortedASC;
};
