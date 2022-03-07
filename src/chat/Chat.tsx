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
import { getMessage } from '../lib/Messaging';

interface ChatProps {
    hasContacts: boolean;
    ensNames: Map<string, string>;
    apiConnection: Lib.ApiConnection;
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
            const message = getMessage(newEnvelop);

            if (
                props.contact &&
                Lib.formatAddress(message.from) ===
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
            await Lib.getMessages(props.apiConnection, props.contact.address),
        );
    };

    const handleMessages = async (
        envelops: (Lib.Envelop | Lib.EncryptionEnvelop)[],
        allEncrypted?: boolean,
    ): Promise<Lib.Envelop[]> => {
        const decryptedEnvelops = await Promise.all(
            envelops.map(async (envelop) => ({
                envelop: Lib.isEncryptionEnvelop(envelop)
                    ? ((await Lib.decryptMessage(
                          props.apiConnection,
                          envelop.from === props.apiConnection.account.address
                              ? envelop.selfData
                              : envelop.data,
                      )) as Lib.Envelop)
                    : envelop,
                encrypted:
                    Lib.isEncryptionEnvelop(envelop) || allEncrypted
                        ? true
                        : false,
            })),
        );

        decryptedEnvelops
            .filter((envelopContainer) =>
                Lib.checkSignature(
                    envelopContainer.envelop.message,
                    Lib.formatAddress(
                        getMessage(envelopContainer.envelop).from,
                    ) === Lib.formatAddress(props.contact.address)
                        ? props.contact
                        : props.apiConnection.account,
                    envelopContainer.envelop.signature,
                ),
            )
            .map((envelopContainer) => ({
                message: getMessage(envelopContainer.envelop),
                encrypted: envelopContainer.encrypted,
            }))
            .sort((a, b) => a.message.timestamp - b.message.timestamp)
            .forEach((messageContainer) => {
                if (
                    messageContainer.message.from ===
                    props.apiConnection.account.address
                ) {
                    addUserMessage(
                        messageContainer.message.message,
                        messageContainer.message.timestamp.toString(),
                    );
                } else {
                    addResponseMessage(
                        messageContainer.message.message,
                        messageContainer.message.timestamp.toString(),
                    );
                }

                messageStates.set(
                    messageContainer.message.timestamp.toString(),
                    Lib.MessageState.Send,
                );
                setMessageStates(new Map(messageStates));
                renderCustomComponent(
                    () => (
                        <MessageStateView
                            messageState={
                                messageStates.get(
                                    messageContainer.message.timestamp.toString(),
                                ) as Lib.MessageState
                            }
                            time={messageContainer.message.timestamp}
                            ownMessage={
                                messageContainer.message.from ===
                                props.apiConnection.account.address
                            }
                            encrypted={messageContainer.encrypted}
                        />
                    ),
                    {},
                );
            });

        return decryptedEnvelops.map(
            (envelopContainer) => envelopContainer.envelop,
        );
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
            props.contact.keys?.publicMessagingKey &&
            props.apiConnection.account?.keys?.publicMessagingKey
                ? true
                : false;

        const messageData = Lib.createMessage(
            props.contact.address,
            props.apiConnection.account.address,
            message,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, Lib.MessageState.Created);
        setMessageStates(new Map(messageStates));

        Lib.submitMessage(
            props.apiConnection,
            props.contact,
            messageData,
            encrypted,
        )
            .then(() => {
                messageStates.set(messageId, Lib.MessageState.Send);
                setMessageStates(new Map(messageStates));
            })
            .catch(() => {
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
