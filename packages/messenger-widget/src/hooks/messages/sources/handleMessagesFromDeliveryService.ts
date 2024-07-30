import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    EncryptionEnvelop,
    Envelop,
    MessageState,
} from '@dm3-org/dm3-lib-messaging';
import { MessageModel, MessageSource } from '../useMessage';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { AddConversation, StoreMessageBatch } from '../../storage/useStorage';
import { Acknowledgment } from '@dm3-org/dm3-lib-delivery';

export const handleMessagesFromDeliveryService = async (
    account: Account,
    profileKeys: ProfileKeys,
    addConversation: AddConversation,
    storeMessageBatch: StoreMessageBatch,
    contact: string,
    fetchNewMessages: (ensName: string, contactAddress: string) => any,
    syncAcknowledgment: (
        ensName: string,
        acknoledgments: Acknowledgment[],
    ) => void,
    updateConversationList: (conversation: string, updatedAt: number) => void,
) => {
    //Fetch the messages from the delivery service
    const encryptedIncommingMessages = await fetchNewMessages(
        account.ensName,
        contact,
    );

    const incommingMessages: MessageModel[] = await Promise.all(
        encryptedIncommingMessages.map(
            async (
                envelop: EncryptionEnvelop,
            ): Promise<MessageModel | null> => {
                try {
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
                        reactions: [],
                        //The source of the message is the delivery service
                        source: MessageSource.DeliveryService,
                    };
                } catch (e) {
                    console.warn('unable to decrypt message ', e);
                    //We return null if the message could not be decrypted.
                    //This way we can filter out the message later an not acknowledge it, to keep it on the DS.
                    //Another client might be able to decrypt it.
                    return null;
                }
            },
        ),
    );

    const messagesSortedASC = incommingMessages
        //Filter out messages that could not be decrypted to only process and acknowledge the ones that could be decrypted
        .filter((message) => message !== null)
        .sort((a, b) => {
            return (
                a.envelop.postmark?.incommingTimestamp! -
                b.envelop.postmark?.incommingTimestamp!
            );
        });
    //If the DS has received messages from that contact we store them, and add the contact to conversation list aswell
    if (messagesSortedASC.length > 0) {
        //If the contact is not already in the conversation list then add it
        await addConversation(contact);
        // Update the conversation with the latest message timestamp
        updateConversationList(
            contact,
            messagesSortedASC[messagesSortedASC.length - 1].envelop.message
                .metadata.timestamp,
        );
        //In the background we sync and acknowledge the messages and store then in the storage
        await storeMessageBatch(contact, messagesSortedASC);
    }

    const acks: Acknowledgment[] = messagesSortedASC.map((message) => ({
        contactAddress: contact,
        messageHash: message.envelop.metadata?.encryptedMessageHash!,
    }));

    await syncAcknowledgment(account.ensName, acks);
    return messagesSortedASC;
};
