import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    createReadOpenMessage,
    createReadReceiveMessage,
    EncryptionEnvelop,
    Envelop,
    MessageState,
} from '@dm3-org/dm3-lib-messaging';
import {
    Account,
    normalizeEnsName,
    ProfileKeys,
} from '@dm3-org/dm3-lib-profile';
import { ContactPreview } from '../../../interfaces/utils';
import { StoreMessageAsync } from '../../storage/useStorage';
import { MessageModel, MessageSource, MessageStorage } from '../useMessage';

export const handleMessagesFromWebSocket = async (
    account: Account,
    addConversation: (
        contactEnsName: string,
    ) => Promise<ContactPreview | undefined>,
    setMessages: Function,
    storeMessage: StoreMessageAsync,
    profileKeys: ProfileKeys,
    selectedContact: ContactPreview,
    encryptedEnvelop: EncryptionEnvelop,
    resolveTLDtoAlias: Function,
    updateConversationList: (conversation: string, updatedAt: number) => void,
    addMessage: Function,
) => {
    const decryptedEnvelop: Envelop = {
        message: JSON.parse(
            await decryptAsymmetric(
                profileKeys?.encryptionKeyPair!,
                JSON.parse(encryptedEnvelop.message),
            ),
        ),
        postmark: JSON.parse(
            await decryptAsymmetric(
                profileKeys?.encryptionKeyPair!,
                JSON.parse(encryptedEnvelop.postmark!),
            ),
        ),
        metadata: encryptedEnvelop.metadata,
    };

    const contact = normalizeEnsName(
        await resolveTLDtoAlias(decryptedEnvelop.message.metadata.from),
    );

    //TODO use TLD name
    await addConversation(decryptedEnvelop.message.metadata.from);

    const messageState =
        selectedContact?.contactDetails.account.ensName === contact
            ? MessageState.Read
            : MessageState.Send;

    const messageModel: MessageModel = {
        envelop: decryptedEnvelop,
        messageState,
        reactions: [],
        source: MessageSource.WebSocket,
    };

    setMessages((prev: MessageStorage) => {
        //Check if message already exists
        if (
            prev[contact]?.find(
                (m) =>
                    m.envelop.metadata?.encryptedMessageHash ===
                    messageModel.envelop.metadata?.encryptedMessageHash,
            )
        ) {
            return prev;
        }
        return {
            ...prev,
            [contact]: [...(prev[contact] ?? []), messageModel],
        };
    });

    // if contact is selected then send READ_OPENED acknowledgment to sender for new message received
    if (
        selectedContact &&
        selectedContact.contactDetails.account.ensName ===
            messageModel.envelop.message.metadata.from
    ) {
        const readedMsg = await createReadOpenMessage(
            messageModel.envelop.message.metadata.from,
            account!.ensName,
            'READ_OPENED',
            profileKeys?.signingKeyPair.privateKey!,
            messageModel.envelop.metadata?.encryptedMessageHash as string,
        );

        await addMessage(messageModel.envelop.message.metadata.from, readedMsg);
    } else if (
        messageModel.envelop.message.metadata.type !== 'READ_RECEIVED' &&
        messageModel.envelop.message.metadata.type !== 'READ_OPENED'
    ) {
        // send READ_RECEIVED acknowledgment to sender for new message received
        const readedMsg = await createReadReceiveMessage(
            messageModel.envelop.message.metadata.from,
            account!.ensName,
            'READ_RECEIVED',
            profileKeys?.signingKeyPair.privateKey!,
            messageModel.envelop.metadata?.encryptedMessageHash as string,
        );

        await addMessage(messageModel.envelop.message.metadata.from, readedMsg);
    }

    // Update the conversation with the latest message timestamp
    updateConversationList(
        contact,
        messageModel.envelop.message.metadata.timestamp,
    );

    storeMessage(contact, messageModel);
};
