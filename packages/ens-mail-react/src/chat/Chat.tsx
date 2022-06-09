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
import * as Lib from 'ens-mail-lib';
import './Chat.css';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';
import InfoBox from './InfoBox';

interface ChatProps {
    connection: Lib.Connection;
    contact: Lib.Account;
}

export interface EnvelopContainer {
    envelop: Lib.Envelop;
    encrypted: boolean;
}

function Chat(props: ChatProps) {
    const { state, dispatch } = useContext(GlobalContext);
    if (!isWidgetOpened()) {
        toggleWidget();
    }
    const [messageStates, setMessageStates] = useState<
        Map<string, Lib.MessageState>
    >(new Map<string, Lib.MessageState>());

    const [messageContainers, setMessageContainers] = useState<
        Lib.StorageEnvelopContainer[]
    >([]);

    const getPastMessages = async () => {
        handleMessages(
            await Lib.getMessages(
                state.connection,
                props.contact.address,
                state.userDb as Lib.UserDB,
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
    };

    const handleMessages = async (
        containers: Lib.StorageEnvelopContainer[],
    ): Promise<void> => {
        const checkedContainers = containers.filter((container) => {
            const account =
                Lib.formatAddress(container.envelop.message.from) ===
                Lib.formatAddress(props.contact.address)
                    ? props.contact
                    : state.connection.account!;

            return account.publicKeys?.publicSigningKey
                ? Lib.checkSignature(
                      container.envelop.message,
                      account.publicKeys!.publicSigningKey,
                      account.address,
                      container.envelop.signature,
                  )
                : false;
        });

        const newMessages = checkedContainers
            .filter(
                (conatier) => conatier.messageState === Lib.MessageState.Send,
            )
            .map((container) => ({
                ...container,
                messageState: Lib.MessageState.Read,
            }));

        const oldMessages = checkedContainers.filter(
            (conatier) =>
                conatier.messageState === Lib.MessageState.Read ||
                conatier.messageState === Lib.MessageState.Created,
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
        if (!props.contact?.publicKeys?.publicKey) {
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
                            ) as Lib.MessageState
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
        if (props.contact) {
            getPastMessages();
        }
    }, [props.contact]);

    useEffect(() => {
        if (props.contact && state.userDb) {
            handleMessages(
                Lib.getConversation(
                    props.contact.address,
                    state.connection,
                    state.userDb,
                ),
            );
        }
    }, [state.userDb?.conversations]);

    const handleNewUserMessage = async (
        message: string,
        userDb: Lib.UserDB,
    ) => {
        deleteMessages(1);

        const haltDelivery =
            props.contact.publicKeys?.publicMessagingKey &&
            state.connection.account?.publicKeys?.publicMessagingKey
                ? false
                : true;

        const messageData = Lib.createMessage(
            props.contact.address,
            state.connection.account!.address,
            message,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, Lib.MessageState.Created);
        setMessageStates(new Map(messageStates));

        try {
            await Lib.submitMessage(
                state.connection,
                userDb,
                props.contact,
                messageData,
                haltDelivery,
                (envelops: Lib.StorageEnvelopContainer[]) =>
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
                    messageStates.set(messageId, Lib.MessageState.Send);
                    setMessageStates(new Map(messageStates));
                },
            );
        } catch (e) {
            Lib.log(e as string);
            messageStates.set(messageId, Lib.MessageState.FailedToSend);
            setMessageStates(new Map(messageStates));
        }
    };

    return (
        <div className="widget-container flex-grow-1">
            <div className="h-100">
                <Widget
                    emojis={false}
                    launcher={() => null}
                    handleNewUserMessage={(message: string) =>
                        handleNewUserMessage(
                            message,
                            state.userDb as Lib.UserDB,
                        )
                    }
                    showTimeStamp={false}
                />
            </div>
        </div>
    );
}

export default Chat;
