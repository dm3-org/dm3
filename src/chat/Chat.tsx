import {
    addResponseMessage,
    addUserMessage,
    deleteMessages,
    dropMessages,
    renderCustomComponent,
    Widget,
} from 'react-chat-widget';
import MessageStateView from './MessageStateView';
import { useEffect, useState } from 'react';
import * as Lib from '../lib';
import './Chat.css';

interface ChatProps {
    hasContacts: boolean;
    ensNames: Map<string, string>;
    connection: Lib.Connection;
    contact: Lib.Account;
}

export interface EnvelopContainer {
    envelop: Lib.Envelop;
    encrypted: boolean;
}

function Chat(props: ChatProps) {
    const [messageStates, setMessageStates] = useState<
        Map<string, Lib.MessageState>
    >(new Map<string, Lib.MessageState>());

    const [messageContainers, setMessageContainers] = useState<
        Lib.StorageEnvelopContainer[]
    >([]);

    const getPastMessages = async () => {
        handleMessages(
            await Lib.getMessages(props.connection, props.contact.address),
        );
    };

    const handleMessages = async (
        containers: Lib.StorageEnvelopContainer[],
    ): Promise<void> => {
        const checkedContainers = containers.filter((container) =>
            Lib.checkSignature(
                container.envelop.message,
                Lib.formatAddress(container.envelop.message.from) ===
                    Lib.formatAddress(props.contact.address)
                    ? props.contact
                    : props.connection.account,
                container.envelop.signature,
            ),
        );

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
        Lib.storeMessages(newMessages, props.connection);
    };

    useEffect(() => {
        dropMessages();
        messageContainers.forEach((container) => {
            if (
                container.envelop.message.from ===
                props.connection.account.address
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
                            props.connection.account.address
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
            props.connection.db.contactNotification = () => {
                handleMessages(
                    Lib.getConversation(
                        props.contact.address,
                        props.connection,
                    ),
                );
            };
        }
    }, [props.contact]);

    useEffect(() => {
        if (props.contact) {
        }
    }, [props.connection]);

    const handleNewUserMessage = async (message: string) => {
        deleteMessages(1);

        const haltDelivery =
            props.contact.publicKeys?.publicMessagingKey &&
            props.connection.account?.publicKeys?.publicMessagingKey
                ? false
                : true;

        const messageData = Lib.createMessage(
            props.contact.address,
            props.connection.account.address,
            message,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, Lib.MessageState.Created);
        setMessageStates(new Map(messageStates));

        Lib.submitMessage(
            props.connection,
            props.contact,
            messageData,
            haltDelivery,
            () => {
                messageStates.set(messageId, Lib.MessageState.Send);
                setMessageStates(new Map(messageStates));
            },
        ).catch((e) => {
            Lib.log(e);
            messageStates.set(messageId, Lib.MessageState.FailedToSend);
            setMessageStates(new Map(messageStates));
        });
    };

    return (
        <div className="row widget-container">
            <div className="col-12 h-100">
                <Widget
                    emojis={false}
                    launcher={() => null}
                    subtitle={null}
                    handleNewUserMessage={handleNewUserMessage}
                    showTimeStamp={false}
                    title={`${
                        props.contact
                            ? Lib.getAccountDisplayName(
                                  props.contact.address,
                                  props.ensNames,
                              )
                            : ''
                    }`}
                />
            </div>
        </div>
    );
}

export default Chat;
