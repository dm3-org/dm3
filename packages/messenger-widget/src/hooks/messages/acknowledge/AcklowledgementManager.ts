import { Account, ProfileKeys } from '@dm3-org/dm3-lib-profile';
import { MessageModel } from '../useMessage';
import {
    createReadOpenMessage,
    createReadReceiveMessage,
} from '@dm3-org/dm3-lib-messaging';
import { ContactPreview } from '../../../interfaces/utils';

//Class that takes care of acknowledging messages
export class AcknowledgmentManager {
    private readonly account: Account;
    private readonly profileKeys: ProfileKeys;
    private readonly addMessage: Function;
    constructor(
        account: Account,
        profileKeys: ProfileKeys,
        addMessage: Function,
    ) {
        this.account = account;
        this.profileKeys = profileKeys;
        this.addMessage = addMessage;
    }
    private ackOpened = async (
        contactAliasName: string,
        messageModel: MessageModel,
    ) => {
        const readedMsg = await createReadOpenMessage(
            messageModel.envelop.message.metadata.from,
            this.account!.ensName,
            'READ_OPENED',
            this.profileKeys?.signingKeyPair.privateKey!,
            messageModel.envelop.metadata?.encryptedMessageHash as string,
        );

        //add the message to dispatch it via useMessage hook
        await this.addMessage(contactAliasName, readedMsg);
    };

    private ackReceived = async (
        contactAliasName: string,
        messageModel: MessageModel,
    ) => {
        const readedMsg = await createReadReceiveMessage(
            messageModel.envelop.message.metadata.from,
            this.account!.ensName,
            'READ_RECEIVED',
            this.profileKeys?.signingKeyPair.privateKey!,
            messageModel.envelop.metadata?.encryptedMessageHash as string,
        );

        //add the message to dispatch it via useMessage hook
        await this.addMessage(contactAliasName, readedMsg);
    };

    public async ackMultiple(
        selectedContact: ContactPreview | undefined,
        contactAliasName: string,
        messageModel: MessageModel[],
    ) {
        await Promise.all(
            messageModel.map((msg) => {
                this.ackSingle(selectedContact, contactAliasName, msg);
            }),
        );
    }

    public async ackSingle(
        selectedContact: ContactPreview | undefined,
        contactAliasName: string,
        messageModel: MessageModel,
    ) {
        //We only want to acknowledge messages from type NEW. Every other message type can be neglected for now
        const msgIsNew = messageModel.envelop.message.metadata.type === 'NEW';
        //Check if the selected contact is the sender of the message.
        // If that is the case we've to acknowledge the message and send a READ_OPENED acknowledgment to the sender
        const selectedContactIsSender =
            selectedContact?.contactDetails.account.ensName ===
            contactAliasName;

        //We acknowledge that we've received the message by sending a READ_RECEIVED acknowledgment to the sender
        if (msgIsNew) {
            await this.ackOpened(contactAliasName, messageModel);
        }

        if (msgIsNew && selectedContactIsSender) {
            // if contact is selected then send READ_OPENED acknowledgment to sender for new message received
            await this.ackReceived(contactAliasName, messageModel);
        }
    }
}
