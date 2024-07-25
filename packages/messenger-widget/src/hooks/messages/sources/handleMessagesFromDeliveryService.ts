import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    createReadOpenMessage,
    createReadReceiveMessage,
    EncryptionEnvelop,
    Envelop,
    MessageState,
} from '@dm3-org/dm3-lib-messaging';
import { MessageModel, MessageSource } from '../useMessage';
import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { AddConversation, StoreMessageBatch } from '../../storage/useStorage';
import { Acknowledgment } from '@dm3-org/dm3-lib-delivery';
import { ContactPreview } from '../../../interfaces/utils';

export const handleMessagesFromDeliveryService = async (
    selectedContact: ContactPreview | undefined,
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
    addMessage: Function,
) => {
    //Fetch the messages from the delivery service
    const encryptedIncommingMessages = await fetchNewMessages(
        account.ensName,
        contact,
    );

    const incommingMessages: MessageModel[] = await Promise.all(
        encryptedIncommingMessages.map(
            async (envelop: EncryptionEnvelop): Promise<MessageModel> => {
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
            },
        ),
    );

    const messagesSortedASC = incommingMessages.sort((a, b) => {
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

    const ackToSend = messagesSortedASC.filter(
        (data) =>
            data.envelop.message.metadata.type !== 'READ_RECEIVED' &&
            data.envelop.message.metadata.type !== 'READ_OPENED',
    );

    // if contact is selected send READ_OPENED acknowledgment to sender for all new messages received
    if (
        ackToSend.length &&
        selectedContact &&
        selectedContact.contactDetails.account.ensName ===
            ackToSend[0].envelop.message.metadata.from
    ) {
        // send READ_OPENED acknowledgment to sender's for all messages
        const openedMsgs = await Promise.all(
            ackToSend.map(async (message: MessageModel) => {
                return await createReadOpenMessage(
                    message.envelop.message.metadata.from,
                    account!.ensName,
                    'READ_OPENED',
                    profileKeys?.signingKeyPair.privateKey!,
                    message.envelop.metadata?.encryptedMessageHash as string,
                );
            }),
        );

        // add message
        await Promise.all(
            openedMsgs.map(async (msg, index) => {
                await addMessage(
                    ackToSend[index].envelop.message.metadata.from,
                    msg,
                );
            }),
        );

        return messagesSortedASC;
    }

    if (ackToSend.length) {
        // send READ_RECEIVED acknowledgment to sender's for all new messages received
        const readedMsgs = await Promise.all(
            ackToSend.map(async (message: MessageModel) => {
                return await createReadReceiveMessage(
                    message.envelop.message.metadata.from,
                    account!.ensName,
                    'READ_RECEIVED',
                    profileKeys?.signingKeyPair.privateKey!,
                    message.envelop.metadata?.encryptedMessageHash as string,
                );
            }),
        );

        // add message
        await Promise.all(
            readedMsgs.map(async (msg, index) => {
                await addMessage(
                    ackToSend[index].envelop.message.metadata.from,
                    msg,
                );
            }),
        );
    }

    return messagesSortedASC;
};
