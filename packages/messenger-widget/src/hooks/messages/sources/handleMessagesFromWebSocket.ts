import { decryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    EncryptionEnvelop,
    Envelop,
    MessageState,
} from '@dm3-org/dm3-lib-messaging';
import { ProfileKeys, normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { ContactPreview } from '../../../interfaces/utils';
import { AddConversation, StoreMessageAsync } from '../../storage/useStorage';
import { MessageStorage } from '../useMessage';

export const handleMessagesFromWebSocket = async (
    addConversation: AddConversation,
    setMessages: Function,
    storeMessage: StoreMessageAsync,
    profileKeys: ProfileKeys,
    selectedContact: ContactPreview,
    encryptedEnvelop: EncryptionEnvelop,
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

    const contact = normalizeEnsName(decryptedEnvelop.message.metadata.from);
    await addConversation(contact);

    const messageState =
        selectedContact?.contactDetails.account.ensName === contact
            ? MessageState.Read
            : MessageState.Send;

    const messageModel = {
        envelop: decryptedEnvelop,
        messageState,
        messageChunkKey: '',
        reactions: [],
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
    storeMessage(contact, messageModel);
};
