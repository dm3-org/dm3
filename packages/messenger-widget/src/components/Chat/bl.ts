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
    CacheType,
    GlobalState,
    MessageActionType,
    UserDbType,
} from '../../utils/enum-type-utils';
import { StorageEnvelopContainer, UserDB } from 'dm3-lib-storage';
import { MessageProps } from '../../interfaces/props';
import { fetchAndStoreMessages } from '../../adapters/messages';

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
        if (!profileDetails || !profileDetails.profile.publicEncryptionKey) {
            setProfileCheck(false);
        } else {
            setProfileCheck(true);
        }
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
    dispatch: React.Dispatch<Actions>,
) => {
    try {
        const msgList: MessageProps[] = [];
        let msg: MessageProps;
        let replyToEnvelop: StorageEnvelopContainer | undefined;
        let reactionToIndex: number | null;
        const messagesMap = new Map<
            string,
            { msgDetails: MessageProps; index: number }
        >();
        messageContainers.forEach((container: StorageEnvelopContainer) => {
            // fetch reply messages
            if (
                container.envelop.message.metadata.referenceMessageHash &&
                container.envelop.message.metadata.type ===
                    MessageActionType.REPLY
            ) {
                const data = messagesMap.get(
                    container.envelop.message.metadata.referenceMessageHash,
                );
                if (data) {
                    replyToEnvelop = data.msgDetails;
                }
            } else {
                replyToEnvelop = undefined;
            }

            // fetch react messages
            if (
                container.envelop.message.metadata.referenceMessageHash &&
                container.envelop.message.metadata.type ===
                    MessageActionType.REACT
            ) {
                const data = messagesMap.get(
                    container.envelop.message.metadata.referenceMessageHash,
                );
                if (
                    data &&
                    (data.msgDetails.message ||
                        (data.msgDetails.envelop.message.attachments &&
                            data.msgDetails.envelop.message.attachments.length))
                ) {
                    reactionToIndex = data.index;
                    if (container.envelop.message.message) {
                        msgList[reactionToIndex].reactions.push(
                            container.envelop,
                        );
                    }
                }
            } else {
                reactionToIndex = null;
            }

            // add message only if its not of REACTION type
            if (!reactionToIndex) {
                msg = {
                    message: container.envelop.message.message!,
                    time: container.envelop.message.metadata.timestamp.toString(),
                    messageState: container.messageState,
                    ownMessage: false,
                    envelop: container.envelop,
                    replyToMsg: replyToEnvelop?.envelop.message.message,
                    replyToMsgFrom:
                        replyToEnvelop?.envelop.message.metadata.from,
                    replyToMsgId:
                        replyToEnvelop?.envelop.metadata?.encryptedMessageHash,
                    reactions: [],
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

                messagesMap.set(
                    msg.envelop.metadata?.encryptedMessageHash as string,
                    {
                        msgDetails: msg,
                        index: msgList.length,
                    },
                );
                msgList.push(msg);
            }
        });

        msgList.length && (msgList[msgList.length - 1].isLastMessage = true);
        setListOfMessages(msgList);

        if (state.accounts.selectedContact) {
            localStorage.setItem(
                state.accounts.selectedContact?.account.ensName,
                JSON.stringify(msgList),
            );
        }

        if (msgList.length) {
            dispatch({
                type: CacheType.LastConversation,
                payload: {
                    account: state.accounts.selectedContact?.account
                        ? state.accounts.selectedContact?.account
                        : null,
                    message: msgList[msgList.length - 1].message.length
                        ? msgList[msgList.length - 1].message
                        : null,
                },
            });
        }
    } catch (error) {}
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
    updateShowShimEffect: Function,
) => {
    if (!isMessageListInitialized && state.accounts.selectedContact) {
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

    handleMessageContainer(
        state,
        oldMessages,
        alias,
        setListOfMessages,
        dispatch,
    );

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

    if (!isMessageListInitialized) {
        scrollToBottomOfChat();
        updateIsMessageListInitialized(true);
    }

    updateShowShimEffect(false);
};
