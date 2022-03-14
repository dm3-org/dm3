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
    newMessages: EnvelopContainer[];
    setNewMessages: (messages: EnvelopContainer[]) => void;
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

    const removeReadMessages = () => {
        props.newMessages.forEach((newEnvelopContainer) => {
            const newEnvelop = newEnvelopContainer.envelop;

            if (
                props.contact &&
                Lib.formatAddress(newEnvelop.message.from) ===
                    Lib.formatAddress(props.contact.address)
            ) {
                handleMessages([newEnvelop], newEnvelopContainer.encrypted);

                if (
                    props.newMessages.find(
                        (envelopContainer) =>
                            envelopContainer.envelop.signature ===
                            newEnvelop.signature,
                    )
                ) {
                    props.setNewMessages(
                        props.newMessages.filter(
                            (envelopContainer) =>
                                envelopContainer.envelop.signature !==
                                newEnvelop.signature,
                        ),
                    );
                }
            }
        });
    };

    useEffect(() => {
        removeReadMessages();
    }, [props.newMessages]);

    const getPastMessages = async () => {
        removeReadMessages();
        handleMessages(
            await Lib.getMessages(props.connection, props.contact.address),
        );
    };

    const handleMessages = async (
        envelops: Lib.Envelop[],
        allEncrypted?: boolean,
    ): Promise<Lib.Envelop[]> => {
        envelops
            .filter((envelop) =>
                Lib.checkSignature(
                    envelop.message,
                    Lib.formatAddress(envelop.message.from) ===
                        Lib.formatAddress(props.contact.address)
                        ? props.contact
                        : props.connection.account,
                    envelop.signature,
                ),
            )
            .forEach((envelop) => {
                if (envelop.message.from === props.connection.account.address) {
                    addUserMessage(
                        envelop.message.message,
                        envelop.message.timestamp.toString(),
                    );
                } else {
                    addResponseMessage(
                        envelop.message.message,
                        envelop.message.timestamp.toString(),
                    );
                }

                messageStates.set(
                    envelop.message.timestamp.toString(),
                    Lib.MessageState.Send,
                );
                setMessageStates(new Map(messageStates));
                renderCustomComponent(
                    () => (
                        <MessageStateView
                            messageState={
                                messageStates.get(
                                    envelop.message.timestamp.toString(),
                                ) as Lib.MessageState
                            }
                            time={envelop.message.timestamp}
                            ownMessage={
                                envelop.message.from ===
                                props.connection.account.address
                            }
                            encrypted={
                                envelop.wasEncrypted || allEncrypted
                                    ? true
                                    : false
                            }
                        />
                    ),
                    {},
                );
            });

        return envelops;
    };

    useEffect(() => {
        if (props.contact) {
            dropMessages();
            getPastMessages();
        }
    }, [props.contact]);

    const handleNewUserMessage = async (message: string) => {
        deleteMessages(1);
        addUserMessage(message);

        const encrypted =
            props.contact.publicKeys?.publicMessagingKey &&
            props.connection.account?.publicKeys?.publicMessagingKey
                ? true
                : false;

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
            () => {
                messageStates.set(messageId, Lib.MessageState.Send);
                setMessageStates(new Map(messageStates));
            },
            encrypted,
        ).catch(() => {
            messageStates.set(messageId, Lib.MessageState.FailedToSend);
            setMessageStates(new Map(messageStates));
        });
        renderCustomComponent(
            () => (
                <MessageStateView
                    messageState={
                        messageStates.get(messageId) as Lib.MessageState
                    }
                    time={messageData.timestamp}
                    ownMessage={true}
                    encrypted={encrypted}
                />
            ),
            {},
        );
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
