import './Chat.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';
import { Message } from '../Message/Message';
import { MessageProps } from '../../interfaces/props';
import { MessageInput } from '../MessageInput/MessageInput';
import {
    MessageState,
    SendDependencies,
    createMessage,
} from 'dm3-lib-messaging';
import {
    StorageEnvelopContainer,
    UserDB,
    getConversation,
} from 'dm3-lib-storage';
import { isSameEnsName } from 'dm3-lib-profile';
import { globalConfig, log } from 'dm3-lib-shared';
import { checkSignature } from './bl';
import { UserDbType } from '../../utils/enum-type-utils';
import { submitMessage } from '../../adapters/messages';
import { MessageContext } from '../../contexts/MessageContext';

export function Chat() {
    const { state, dispatch } = useContext(GlobalContext);
    const { submitMessage, fetchAndStoreMessages } = useContext(MessageContext);

    const [messageList, setMessageList] = useState([
        {
            message: 'Hii bro !',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: false,
        },
        {
            message: 'Hope you are doing well',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: false,
        },
        {
            message: `Hii bruh, Yeah I am good! How are you doing man? 
            It's really a long time we talked. 
            I miss those old memorable days we enjoyed in our childhood !`,
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: true,
        },
        {
            message: 'Me too good',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: false,
        },
        {
            message: 'Nice to hear that',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Send,
            ownMessage: true,
        },
        {
            message: 'Lets meet tomorrow',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: false,
        },
        {
            message: 'Sure, at 6PM',
            time: '21/09/2022, 15:09:46',
            messageState: MessageState.Read,
            ownMessage: true,
        },
    ]);

    const isProfileConfigured =
        state.accounts.selectedContact?.account.profile?.publicEncryptionKey;

    const alias =
        state.connection.ethAddress &&
        state.connection.ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN();

    // scroll to bottom automatically
    const scrollToBottomOfChat = () => {
        const element: HTMLElement = document.getElementById(
            'chat-box',
        ) as HTMLElement;
        if (element) element.scrollTop = element.scrollHeight;
    };

    const handleMessageContainer = (
        messageContainers: StorageEnvelopContainer[],
    ) => {
        const msgList = [];
        let msg: MessageProps;
        messageContainers.forEach((container: StorageEnvelopContainer) => {
            msg = {
                message: container.envelop.message.message!,
                time: container.envelop.message.metadata.timestamp.toString(),
                messageState: container.messageState,
                ownMessage: false,
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
    };

    // method to set the message list
    const handleMessages = (containers: StorageEnvelopContainer[]): void => {
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
            .filter((conatier) => conatier.messageState === MessageState.Send)
            .map((container) => ({
                ...container,
                messageState: MessageState.Read,
            }));

        const oldMessages = checkedContainers.filter(
            (conatier) =>
                conatier.messageState === MessageState.Read ||
                conatier.messageState === MessageState.Created,
        );

        handleMessageContainer(oldMessages);

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
    };

    const handleNewUserMessage = async (message: string, userDb: UserDB) => {
        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const haltDelivery =
            state.accounts.selectedContact?.account.profile
                ?.publicEncryptionKey &&
            state.connection.account?.profile?.publicEncryptionKey
                ? false
                : true;
        const messageData = await createMessage(
            state.accounts.selectedContact.account.ensName,
            state.connection.account!.ensName,
            message,
            userDb.keys.signingKeyPair.privateKey,
        );

        const sendDependencies: SendDependencies = {
            deliverServiceProfile:
                state.accounts.selectedContact.deliveryServiceProfile!,
            from: state.connection.account!,
            to: state.accounts.selectedContact.account,
            keys: userDb.keys,
        };

        try {
            await submitMessage(
                state.connection,
                state.auth.currentSession?.token!,
                sendDependencies,
                messageData,
                haltDelivery,
                (envelops: StorageEnvelopContainer[]) =>
                    envelops.forEach((envelop) =>
                        dispatch({
                            type: UserDbType.addMessage,
                            payload: {
                                container: envelop,
                                connection: state.connection,
                            },
                        }),
                    ),
            );
        } catch (e) {
            log('[handleNewUserMessage] ' + JSON.stringify(e), 'error');
        }
    };

    useEffect(() => {
        if (
            state.accounts.selectedContact &&
            state.userDb &&
            state.accounts.contacts
        ) {
            handleMessages(
                getConversation(
                    state.accounts.selectedContact.account.ensName,
                    state.accounts.contacts.map((contact) => contact.account),
                    state.userDb,
                ),
            );
        }
    }, [
        state.userDb?.conversations,
        state.accounts.selectedContact,
        state.accounts.contacts,
    ]);

    useEffect(() => {
        let ignore = false;
        const getPastMessages = async () => {
            if (!state.accounts.selectedContact) {
                throw Error('no contact selected');
            }
            const messages = await fetchAndStoreMessages(
                state.connection,
                state.auth.currentSession?.token!,
                state.accounts.selectedContact.account.ensName,
                state.userDb as UserDB,
                (envelops) => {
                    if (!ignore) {
                        envelops.forEach((envelop) =>
                            dispatch({
                                type: UserDbType.addMessage,
                                payload: {
                                    container: envelop,
                                    connection: state.connection,
                                },
                            }),
                        );
                    }
                },
                state.accounts.contacts
                    ? state.accounts.contacts.map((contact) => contact.account)
                    : [],
            );

            if (!ignore && messages.length > 0) {
                handleMessages(messages);
            }
        };

        if (!ignore && state.accounts.selectedContact) {
            getPastMessages();
        }

        return () => {
            ignore = true;
        };
    }, [state.accounts.selectedContact]);

    useEffect(() => {
        scrollToBottomOfChat();
    }, [messageList]);

    return (
        <div
            className={
                state.accounts.selectedContact
                    ? 'highlight-chat-border'
                    : 'highlight-chat-border-none'
            }
        >
            <div className="m-2 text-primary-color position-relative chat-container">
                {/* To show information box that contact has not created profile */}
                {!isProfileConfigured && <ConfigProfileAlertBox />}

                {/* Chat messages */}
                <div
                    id="chat-box"
                    className={'chat-items position-relative'.concat(
                        ' ',
                        !isProfileConfigured
                            ? 'chat-height-small'
                            : 'chat-height-high',
                    )}
                >
                    {messageList.length &&
                        messageList.map((messageData, index) => (
                            <div key={index} className="mt-2">
                                <Message {...(messageData as MessageProps)} />
                            </div>
                        ))}
                    <br />
                </div>

                {/* Message, emoji and file attachments */}
                <MessageInput
                    messageList={messageList}
                    setMessageList={setMessageList}
                />
            </div>
        </div>
    );
}
