import './Chat.css';
import { Message } from '../Message/Message';
import { getConversation } from 'dm3-lib-storage';
import { globalConfig, log } from 'dm3-lib-shared';
import { MessageProps } from '../../interfaces/props';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { MessageInputBox } from '../MessageInputBox/MessageInputBox';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';
import {
    checkUserProfileConfigured,
    handleMessages,
    scrollToBottomOfChat,
} from './bl';
import { MessageActionType } from '../../utils/enum-type-utils';

export function Chat() {
    const { state, dispatch } = useContext(GlobalContext);

    const [messageList, setMessageList] = useState<MessageProps[]>([]);
    const [isMessageListInitialized, setIsMessageListInitialized] =
        useState<boolean>(false);
    const [isProfileConfigured, setIsProfileConfigured] =
        useState<boolean>(false);

    const alias =
        state.connection.ethAddress &&
        state.connection.ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN();

    const setProfileCheck = (status: boolean) => {
        setIsProfileConfigured(status);
    };

    const setListOfMessages = (msgs: []) => {
        setMessageList(msgs);
    };

    const updateIsMessageListInitialized = (action: boolean) => {
        setIsMessageListInitialized(action);
    };

    useEffect(() => {
        setIsMessageListInitialized(false);
    }, [state.accounts.selectedContact]);

    // handles messages list
    useEffect(() => {
        setIsProfileConfigured(true);
        let isInitialized = false;

        // fetch the messages from local storage is exists
        if (state.accounts.selectedContact) {
            const msgDetails = localStorage.getItem(
                state.accounts.selectedContact?.account.ensName,
            );
            if (msgDetails) {
                isInitialized = true;
                setListOfMessages(JSON.parse(msgDetails));
            }
        }

        checkUserProfileConfigured(
            state,
            state.accounts.selectedContact?.account.ensName as string,
            setProfileCheck,
        );
        if (
            state.accounts.selectedContact &&
            state.userDb &&
            state.accounts.contacts
        ) {
            try {
                handleMessages(
                    state,
                    dispatch,
                    getConversation(
                        state.accounts.selectedContact.account.ensName,
                        state.accounts.contacts.map(
                            (contact) => contact.account,
                        ),
                        state.userDb,
                    ),
                    alias,
                    setListOfMessages,
                    isInitialized,
                    updateIsMessageListInitialized,
                );
            } catch (error) {
                setListOfMessages([]);
                log(error, 'error');
            }
        }
    }, [state.userDb?.conversations, state.accounts.selectedContact]);

    useEffect(() => {
        if (
            messageList.length &&
            (state.modal.lastMessageAction === MessageActionType.NONE ||
                state.modal.lastMessageAction === MessageActionType.REPLY ||
                state.modal.lastMessageAction === MessageActionType.NEW)
        ) {
            scrollToBottomOfChat();
        }
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
                    className={'chat-items position-relative mb-2'.concat(
                        ' ',
                        !isProfileConfigured
                            ? 'chat-height-small'
                            : 'chat-height-high',
                    )}
                >
                    {messageList.length > 0 &&
                        messageList.map((messageData: MessageProps, index) => (
                            <div key={index} className="mt-2">
                                <Message {...messageData} />
                            </div>
                        ))}
                </div>

                {/* Message, emoji and file attachments */}
                <MessageInputBox />
            </div>
        </div>
    );
}
