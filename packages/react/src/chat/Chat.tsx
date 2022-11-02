import {
    addResponseMessage,
    addUserMessage,
    deleteMessages,
    dropMessages,
    renderCustomComponent,
    isWidgetOpened,
    toggleWidget,
    Widget,
} from 'react-chat-widget';
import MessageStateView from './MessageStateView';
import { useContext, useEffect, useState } from 'react';
import * as Lib from 'dm3-lib';
import './Chat.css';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';
import InfoBox from './InfoBox';
import { UiStateType } from '../reducers/UiState';
import StorageView from '../storage/StorageView';

export interface EnvelopContainer {
    envelop: Lib.messaging.Envelop;
    encrypted: boolean;
}

function Chat() {
    const { state, dispatch } = useContext(GlobalContext);
    if (!isWidgetOpened()) {
        toggleWidget();
    }
    const [messageStates, setMessageStates] = useState<
        Map<string, Lib.messaging.MessageState>
    >(new Map<string, Lib.messaging.MessageState>());

    const [messageContainers, setMessageContainers] = useState<
        Lib.storage.StorageEnvelopContainer[]
    >([]);

    const getPastMessages = async () => {
        const lastMessagePull = new Date().getTime();
        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }
        handleMessages(
            await Lib.messaging.getMessages(
                state.connection,
                state.accounts.selectedContact.address,
                state.userDb as Lib.storage.UserDB,
                (envelops) =>
                    envelops.forEach((envelop) =>
                        dispatch({
                            type: UserDbType.addMessage,
                            payload: {
                                container: envelop,
                                connection: state.connection,
                            },
                        }),
                    ),
            ),
        );
        dispatch({
            type: UiStateType.SetLastMessagePull,
            payload: lastMessagePull,
        });
    };

    const handleMessages = async (
        containers: Lib.storage.StorageEnvelopContainer[],
    ): Promise<void> => {
        const checkedContainers = containers.filter((container) => {
            if (!state.accounts.selectedContact) {
                throw Error('No selected contact');
            }
            const account =
                Lib.external.formatAddress(container.envelop.message.from) ===
                Lib.external.formatAddress(
                    state.accounts.selectedContact.address,
                )
                    ? state.accounts.selectedContact
                    : state.connection.account!;

            return account.profile?.publicSigningKey
                ? Lib.encryption.checkSignature(
                      container.envelop.message,
                      account.profile?.publicSigningKey,
                      account.address,
                      container.envelop.signature,
                  )
                : false;
        });

        const newMessages = checkedContainers
            .filter(
                (conatier) =>
                    conatier.messageState === Lib.messaging.MessageState.Send,
            )
            .map((container) => ({
                ...container,
                messageState: Lib.messaging.MessageState.Read,
            }));

        const oldMessages = checkedContainers.filter(
            (conatier) =>
                conatier.messageState === Lib.messaging.MessageState.Read ||
                conatier.messageState === Lib.messaging.MessageState.Created,
        );

        setMessageContainers(oldMessages);

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

    useEffect(() => {
        dropMessages();
        if (!state.accounts.selectedContact?.profile?.publicEncryptionKey) {
            renderCustomComponent(
                () => (
                    <InfoBox
                        text={
                            `This user hasn't created encryption keys yet.` +
                            ` The messages will be sent as soon as the keys have been created.`
                        }
                    />
                ),
                {},
            );
        }

        messageContainers.forEach((container) => {
            if (
                container.envelop.message.from ===
                state.connection.account!.address
            ) {
                addUserMessage(
                    container.envelop.message.message,
                    container.envelop.message.timestamp.toString(),
                );
            } else {
                addResponseMessage(
                    container.envelop.message.message,
                    container.envelop.message.timestamp.toString(),
                );
            }

            messageStates.set(
                container.envelop.message.timestamp.toString(),
                container.messageState,
            );
            setMessageStates(new Map(messageStates));
            renderCustomComponent(
                () => (
                    <MessageStateView
                        messageState={
                            messageStates.get(
                                container.envelop.message.timestamp.toString(),
                            ) as Lib.messaging.MessageState
                        }
                        time={container.envelop.message.timestamp}
                        ownMessage={
                            container.envelop.message.from ===
                            state.connection.account!.address
                        }
                    />
                ),
                {},
            );
        });
    }, [messageContainers]);

    useEffect(() => {
        setMessageContainers([]);
        setMessageStates(new Map<string, Lib.messaging.MessageState>());
        if (state.accounts.selectedContact) {
            getPastMessages();
        }
    }, [state.accounts.selectedContact]);

    useEffect(() => {
        if (state.accounts.selectedContact && state.userDb) {
            handleMessages(
                Lib.storage.getConversation(
                    state.accounts.selectedContact.address,
                    state.connection,
                    state.userDb,
                ),
            );
        }
    }, [state.userDb?.conversations]);

    const handleNewUserMessage = async (
        message: string,
        userDb: Lib.storage.UserDB,
    ) => {
        deleteMessages(1);
        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const haltDelivery =
            state.accounts.selectedContact?.profile?.publicEncryptionKey &&
            state.connection.account?.profile?.publicEncryptionKey
                ? false
                : true;

        const messageData = Lib.messaging.createMessage(
            state.accounts.selectedContact.address,
            state.connection.account!.address,
            message,
            userDb,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, Lib.messaging.MessageState.Created);
        setMessageStates(new Map(messageStates));

        try {
            await Lib.messaging.submitMessage(
                state.connection,
                userDb,
                state.accounts.selectedContact,
                messageData,
                haltDelivery,
                (envelops: Lib.storage.StorageEnvelopContainer[]) =>
                    envelops.forEach((envelop) =>
                        dispatch({
                            type: UserDbType.addMessage,
                            payload: {
                                container: envelop,
                                connection: state.connection,
                            },
                        }),
                    ),

                () => {
                    messageStates.set(
                        messageId,
                        Lib.messaging.MessageState.Send,
                    );
                    setMessageStates(new Map(messageStates));
                },
            );
        } catch (e) {
            Lib.log(e as string);
            messageStates.set(
                messageId,
                Lib.messaging.MessageState.FailedToSend,
            );
            setMessageStates(new Map(messageStates));
        }
    };

    return (
        <div className="widget-container flex-grow-1">
            <div className="h-100">
                {/* @ts-ignore */}
                <Widget
                    emojis={false}
                    launcher={() => null}
                    handleNewUserMessage={(message: string) =>
                        handleNewUserMessage(
                            message,
                            state.userDb as Lib.storage.UserDB,
                        )
                    }
                    showTimeStamp={false}
                />

                {!state.uiState.maxLeftView && <StorageView />}
            </div>
        </div>
    );
}

export default Chat;
