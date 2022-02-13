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
import { encryptSafely } from './lib/Encryption';

interface ChatProps {
    hasContacts: boolean;
    ensNames: Map<string, string>;
    apiConnection: ApiConnection;
    newMessages: Envelop[];
    setNewMessages: (messages: Envelop[]) => void;
    contact: Account;
}

function Chat(props: ChatProps) {
    const [messageStates, setMessageStates] = useState<
        Map<string, MessageState>
    >(new Map<string, MessageState>());

    const removeReadMessages = () => {
        props.newMessages.forEach((newEnvelop) => {
            const message = JSON.parse(newEnvelop.message) as Message;

            if (
                props.contact &&
                ethers.utils.getAddress(message.from) ===
                    ethers.utils.getAddress(props.contact.address)
            ) {
                handleMessages([newEnvelop]);

                if (
                    props.newMessages.find(
                        (envelop) => envelop.signature === newEnvelop.signature,
                    )
                ) {
                    props.setNewMessages(
                        props.newMessages.filter(
                            (envelop) =>
                                envelop.signature !== newEnvelop.signature,
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
    ) => {
        const decryptedEnvelops = await Promise.all(
            envelops.map(async (envelop) =>
                (envelop as EncryptionEnvelop).encryptionVersion
                    ? (JSON.parse(
                          await decrypt(
                              props.apiConnection
                                  .provider as ethers.providers.JsonRpcProvider,
                              (envelop as EncryptionEnvelop).data,
                              (props.apiConnection.account as Account).address,
                          ),
                      ).data as Envelop)
                    : (envelop as Envelop),
            ),
        );

        decryptedEnvelops

            .map((envelop) => JSON.parse(envelop.message) as Message)
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach((message) => {
                if (
                    message.from ===
                    ((props.apiConnection.account as Account).address as string)
                ) {
                    addUserMessage(
                        message.message,
                        message.timestamp.toString(),
                    );
                } else {
                    addResponseMessage(
                        message.message,
                        message.timestamp.toString(),
                    );
                }

                messageStates.set(
                    message.timestamp.toString(),
                    MessageState.Signed,
                );
                setMessageStates(new Map(messageStates));
                renderCustomComponent(
                    () => (
                        <MessageStateView
                            messageState={
                                messageStates.get(
                                    message.timestamp.toString(),
                                ) as MessageState
                            }
                            time={message.timestamp}
                            ownMessage={
                                message.from ===
                                (props.apiConnection.account as Account).address
                                    ? true
                                    : false
                            }
                        />
                    ),
                    {},
                );
            });
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
            props.contact.keys?.publicMessagingKey &&
                props.apiConnection.account?.keys?.publicMessagingKey
                ? true
                : false,
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
