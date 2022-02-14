import {
    addResponseMessage,
    addUserMessage,
    deleteMessages,
    dropMessages,
    renderCustomComponent,
    Widget,
} from 'react-chat-widget';

import {
    createMessage,
    EncryptionEnvelop,
    Envelop,
    getMessages,
    Message,
    MessageState,
    submitMessage,
} from './lib/Messaging';
import {
    Account,
    ApiConnection,
    getAccountDisplayName,
} from './lib/Web3Provider';
import {
    submitMessage as submitMessageApi,
    getMessages as getMessagesApi,
} from './external-apis/BackendAPI';
import { decrypt, prersonalSign } from './external-apis/InjectedWeb3API';
import MessageStateView from './MessageStateView';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { decryptMessage, EthEncryptedData } from './lib/Encryption';

interface ChatProps {
    hasContacts: boolean;
    ensNames: Map<string, string>;
    apiConnection: ApiConnection;
    newMessages: EnvelopContainer[];
    setNewMessages: (messages: EnvelopContainer[]) => void;
    contact: Account;
}

export interface EnvelopContainer {
    envelop: Envelop;
    encrypted: boolean;
}

function Chat(props: ChatProps) {
    const [messageStates, setMessageStates] = useState<
        Map<string, MessageState>
    >(new Map<string, MessageState>());

    const removeReadMessages = () => {
        props.newMessages.forEach((newEnvelopContainer) => {
            const newEnvelop = newEnvelopContainer.envelop;
            const message = JSON.parse(newEnvelop.message) as Message;

            if (
                props.contact &&
                ethers.utils.getAddress(message.from) ===
                    ethers.utils.getAddress(props.contact.address)
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
            await getMessages(
                props.apiConnection,
                props.contact.address,
                getMessagesApi,
            ),
        );
    };

    const handleMessages = async (
        envelops: (Envelop | EncryptionEnvelop)[],
        allEncrypted?: boolean,
    ): Promise<Envelop[]> => {
        const decryptedEnvelops = await Promise.all(
            envelops.map(async (envelop) => ({
                envelop: (envelop as EncryptionEnvelop).encryptionVersion
                    ? ((await decryptMessage(
                          props.apiConnection,
                          (envelop as EncryptionEnvelop).from ===
                              (props.apiConnection.account?.address as string)
                              ? (envelop as EncryptionEnvelop).selfData
                              : (envelop as EncryptionEnvelop).data,
                      )) as Envelop)
                    : (envelop as Envelop),
                encrypted:
                    (envelop as EncryptionEnvelop).encryptionVersion ||
                    allEncrypted
                        ? true
                        : false,
            })),
        );

        decryptedEnvelops

            .map((envelopContainer) => ({
                message: JSON.parse(
                    envelopContainer.envelop.message,
                ) as Message,
                encrypted: envelopContainer.encrypted,
            }))
            .sort((a, b) => a.message.timestamp - b.message.timestamp)
            .forEach((messageContainer) => {
                if (
                    messageContainer.message.from ===
                    ((props.apiConnection.account as Account).address as string)
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
                    MessageState.Signed,
                );
                setMessageStates(new Map(messageStates));
                renderCustomComponent(
                    () => (
                        <MessageStateView
                            messageState={
                                messageStates.get(
                                    messageContainer.message.timestamp.toString(),
                                ) as MessageState
                            }
                            time={messageContainer.message.timestamp}
                            ownMessage={
                                messageContainer.message.from ===
                                (props.apiConnection.account as Account).address
                                    ? true
                                    : false
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

        const messageData = createMessage(
            props.contact.address,
            (props.apiConnection.account as Account).address,
            message,
        );
        const messageId = messageData.timestamp.toString();
        messageStates.set(messageId, MessageState.Created);
        setMessageStates(new Map(messageStates));

        submitMessage(
            props.apiConnection,
            props.contact,
            messageData,
            submitMessageApi,
            prersonalSign,
            encrypted,
        ).then(() => {
            messageStates.set(messageId, MessageState.Signed);
            setMessageStates(new Map(messageStates));
        });
        renderCustomComponent(
            () => (
                <MessageStateView
                    messageState={messageStates.get(messageId) as MessageState}
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
                            ? getAccountDisplayName(
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
