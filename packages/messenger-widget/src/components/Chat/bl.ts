import { checkSignature as _checkSignature } from 'dm3-lib-crypto';
import { Message, MessageState } from 'dm3-lib-messaging';
import {
    getUserProfile,
    isSameEnsName,
    normalizeEnsName,
} from 'dm3-lib-profile';
import { log, stringify } from 'dm3-lib-shared';
import {
    Actions,
    GlobalState,
    MessageActionType,
    ModalStateType,
    UserDbType,
} from '../../utils/enum-type-utils';
import { StorageEnvelopContainer, UserDB } from 'dm3-lib-storage';
import { fetchAndStoreMessages } from '../../adapters/messages';
import { MessageProps } from '../../interfaces/props';
import { closeLoader, startLoader } from '../Loader/Loader';

// method to check message signature
export async function checkSignature(
    message: Message,
    publicSigningKey: string,
    ensName: string,
    signature: string,
): Promise<boolean> {
    const sigCheck = await _checkSignature(
        publicSigningKey,
        stringify(message)!,
        signature,
    );

    if (
        sigCheck &&
        normalizeEnsName(ensName) !== normalizeEnsName(message.metadata.from)
    ) {
        return true;
    } else {
        log(`Signature check for ${ensName} failed.`, 'error');
        return false;
    }
}

// method to check user profile is configured or not
export const checkUserProfileConfigured = async (
    state: GlobalState,
    ensName: string,
    setProfileCheck: Function,
) => {
    try {
        const profileDetails = await getUserProfile(
            state.connection.provider!,
            ensName,
        );
        setProfileCheck(
            profileDetails && profileDetails.profile.publicEncryptionKey
                ? true
                : false,
        );
    } catch (error) {
        setProfileCheck(false);
    }
};

// method to scroll down to latest message automatically
export const scrollToBottomOfChat = () => {
    const element: HTMLElement = document.getElementById(
        'chat-box',
    ) as HTMLElement;
    if (element) element.scrollTop = element.scrollHeight;
};

// method to set message format
const handleMessageContainer = (
    state: GlobalState,
    messageContainers: StorageEnvelopContainer[],
    alias: string | undefined,
    setListOfMessages: Function,
) => {
    const msgList: MessageProps[] = [];
    let msg: MessageProps;
    let replyToEnvelop: StorageEnvelopContainer | undefined;
    messageContainers.forEach((container: StorageEnvelopContainer) => {
        if (
            container.envelop.message.metadata.type ===
                MessageActionType.REPLY &&
            container.envelop.message.metadata.referenceMessageHash
        ) {
            replyToEnvelop = fetchEnvelop(
                messageContainers,
                container.envelop.message.metadata.referenceMessageHash,
            );
        } else {
            replyToEnvelop = undefined;
        }
        msg = {
            message: container.envelop.message.message!,
            time: container.envelop.message.metadata.timestamp.toString(),
            messageState: container.messageState,
            ownMessage: false,
            envelop: container.envelop,
            replyToMsg: replyToEnvelop?.envelop.message.message,
            replyToMsgFrom: replyToEnvelop?.envelop.message.metadata.from,
        };
        if (
            isSameEnsName(
                container.envelop.message.metadata.from,
                state.connection.account!.ensName,
                alias,
            )
        ) {
            msg.ownMessage = true;
        }

        msgList.push(msg);
    });
    setListOfMessages(msgList);
};

// method to set the message list
export const handleMessages = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    containers: StorageEnvelopContainer[],
    alias: string | undefined,
    setListOfMessages: Function,
    isMessageListInitialized: boolean,
    updateIsMessageListInitialized: Function,
) => {
    if (!isMessageListInitialized && state.accounts.selectedContact) {
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Fetching messages',
        });
        startLoader();
        await fetchAndStoreMessages(
            state.connection,
            state.auth.currentSession?.token!,
            state.accounts.selectedContact.account.ensName,
            state.userDb as UserDB,
            (envelops) => {
                envelops.forEach((envelop) =>
                    dispatch({
                        type: UserDbType.addMessage,
                        payload: {
                            container: envelop,
                            connection: state.connection,
                        },
                    }),
                );
            },
            state.accounts.contacts
                ? state.accounts.contacts.map((contact) => contact.account)
                : [],
        );
        updateIsMessageListInitialized(true);
    }

    const checkedContainers = containers.filter((container) => {
        if (!state.accounts.selectedContact) {
            throw Error('No selected contact');
        }

        const account = isSameEnsName(
            container.envelop.message.metadata.from,
            state.accounts.selectedContact.account.ensName,
            alias,
        )
            ? state.accounts.selectedContact.account
            : state.connection.account!;

        return account.profile?.publicSigningKey
            ? checkSignature(
                  container.envelop.message,
                  account.profile?.publicSigningKey,
                  account.ensName,
                  container.envelop.message.signature,
              )
            : true;
    });

    const newMessages = checkedContainers
        .filter((container) => container.messageState === MessageState.Send)
        .map((container) => ({
            ...container,
            messageState: MessageState.Read,
        }));

    const oldMessages = checkedContainers.filter(
        (container) =>
            container.messageState === MessageState.Read ||
            container.messageState === MessageState.Created,
    );

    handleMessageContainer(state, oldMessages, alias, setListOfMessages);

    if (!state.userDb) {
        throw Error(
            `[handleMessages] Couldn't handle new messages. User db not created.`,
        );
    }

    if (newMessages.length > 0) {
        newMessages.forEach((message) =>
            dispatch({
                type: UserDbType.addMessage,
                payload: {
                    container: message,
                    connection: state.connection,
                },
            }),
        );
    }

    closeLoader();
};

// method specific envelop
const fetchEnvelop = (
    containerList: StorageEnvelopContainer[],
    replyToMsgHash: string,
) => {
    const replyEnvelop = containerList.filter(
        (data) =>
            data.envelop.metadata?.encryptedMessageHash &&
            data.envelop.metadata.encryptedMessageHash === replyToMsgHash,
    );
    return replyEnvelop.length ? replyEnvelop[0] : undefined;
};
