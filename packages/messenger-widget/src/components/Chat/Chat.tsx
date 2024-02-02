/* eslint-disable no-console */
import { globalConfig, log } from '@dm3-org/dm3-lib-shared';
import { getConversation } from '@dm3-org/dm3-lib-storage';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { HideFunctionProps, MessageProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';
import { Message } from '../Message/Message';
import { MessageInputBox } from '../MessageInputBox/MessageInputBox';
import './Chat.css';
import {
    checkUserProfileConfigured,
    handleMessages,
    scrollToBottomOfChat,
} from './bl';

export function Chat(props: HideFunctionProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { account } = useContext(AuthContext);
    const { ethAddress, deliveryServiceToken } = useContext(AuthContext);
    const { selectedContact } = useContext(ConversationContext);
    const mainnetProvider = useMainnetProvider();

    const [messageList, setMessageList] = useState<MessageProps[]>([]);
    const [isMessageListInitialized, setIsMessageListInitialized] =
        useState<boolean>(false);
    const [isProfileConfigured, setIsProfileConfigured] =
        useState<boolean>(false);
    const [showShimEffect, setShowShimEffect] = useState(false);

    const alias = ethAddress && ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN();

    const setProfileCheck = (status: boolean) => {
        setIsProfileConfigured(status);
    };

    const updateShowShimEffect = (action: boolean) => {
        setShowShimEffect(action);
    };

    const setListOfMessages = (msgs: []) => {
        setMessageList(msgs);
    };

    const updateIsMessageListInitialized = (action: boolean) => {
        setIsMessageListInitialized(action);
    };

    useEffect(() => {
        setIsMessageListInitialized(false);
        setIsProfileConfigured(
            selectedContact?.contactDetails.account.profile ? true : false,
        );
    }, [selectedContact]);

    // handles messages list
    useEffect(() => {
        if (selectedContact) {
            setShowShimEffect(true);
        }
        if (selectedContact) {
            console.log('fetching old messages selectedC');

            try {
                handleMessages(
                    state,
                    mainnetProvider,
                    account!,
                    deliveryServiceToken!,
                    dispatch,
                    //TODO refactor to new conversation Object
                    [],
                    alias,
                    setListOfMessages,
                    isMessageListInitialized,
                    updateIsMessageListInitialized,
                    updateShowShimEffect,
                    props.hideFunction,
                );
            } catch (error) {
                setListOfMessages([]);
                setShowShimEffect(false);
                log(error, 'error');
            }
        }
    }, [state.userDb?.conversations, selectedContact]);

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

    useEffect(() => {
        checkUserProfileConfigured(
            mainnetProvider,
            selectedContact?.contactDetails.account.ensName as string,
            setProfileCheck,
        );
        if (state.modal.addConversation.active) {
            setShowShimEffect(true);
        }
        // fetches old message if new contact is added
        if (
            !state.modal.addConversation.active &&
            selectedContact &&
            state.userDb &&
            state.accounts.contacts
        ) {
            setShowShimEffect(true);
            console.log('fetching old messages');
            try {
                handleMessages(
                    state,
                    mainnetProvider,
                    account!,
                    deliveryServiceToken!,
                    dispatch,
                    getConversation(
                        selectedContact.contactDetails.account.ensName,
                        state.accounts.contacts.map(
                            (contact) => contact.account,
                        ),
                        state.userDb,
                    ),
                    alias,
                    setListOfMessages,
                    isMessageListInitialized,
                    updateIsMessageListInitialized,
                    updateShowShimEffect,
                    props.hideFunction,
                );
            } catch (error) {
                setListOfMessages([]);
                setShowShimEffect(false);
                log(error, 'error');
            }
        }
    }, [state.modal.addConversation.active]);

    /* shimmer effect contacts css */
    const shimmerData: number[] = Array.from({ length: 50 }, (_, i) => i + 1);

    return (
        <div
            id="chat-msgs"
            className={'chat-msgs width-fill '
                .concat(
                    selectedContact
                        ? 'highlight-chat-border'
                        : 'highlight-chat-border-none',
                )
                .concat(' ', !props.showContacts ? ' ps-2 pe-2' : '')}
        >
            {/* Shimmer effect while messages are loading */}
            {showShimEffect && (
                <div
                    id="chat-box"
                    className={
                        'chat-items position-relative mb-2 skeletion-chat-height'
                    }
                >
                    {shimmerData.map((item, index) => {
                        return (
                            <span
                                key={index}
                                className={'text-primary-color d-grid msg'.concat(
                                    ' ',
                                    index % 2
                                        ? 'me-2 justify-content-end'
                                        : 'ms-2 justify-content-start',
                                )}
                            >
                                <div className="d-flex">
                                    <div
                                        className="width-fill text-left font-size-14 border-radius-6 content-style 
                                        ms-3 background-config-box skeleton-message"
                                    ></div>
                                </div>
                            </span>
                        );
                    })}
                </div>
            )}

            {!showShimEffect && (
                <>
                    {/* To show information box that contact has not created profile */}
                    {!isProfileConfigured && <ConfigProfileAlertBox />}

                    {/* Chat messages */}
                    <div
                        id="chat-box"
                        className={'chat-items mb-2'.concat(
                            ' ',
                            !isProfileConfigured
                                ? 'chat-height-small'
                                : 'chat-height-high',
                        )}
                    >
                        {messageList.length > 0 &&
                            messageList.map(
                                (messageData: MessageProps, index) => (
                                    <div key={index} className="mt-2">
                                        <Message {...messageData} />
                                    </div>
                                ),
                            )}
                    </div>

                    {/* Message, emoji and file attachments */}
                    <MessageInputBox hideFunction={props.hideFunction} />
                </>
            )}
        </div>
    );
}
