import { globalConfig, log } from '@dm3-org/dm3-lib-shared';
import {
    StorageEnvelopContainer,
    getConversation,
} from '@dm3-org/dm3-lib-storage';
import { useContext, useEffect, useMemo, useState } from 'react';
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
import { MessageContext } from '../../context/MessageContext';
import { MessageModel } from '../../hooks/messages/useMessage';

export function Chat(props: HideFunctionProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { ethAddress, deliveryServiceToken, account } =
        useContext(AuthContext);
    const { selectedContact } = useContext(ConversationContext);
    const { getMessages, contactIsLoading } = useContext(MessageContext);
    const mainnetProvider = useMainnetProvider();

    const [isMessageListInitialized, setIsMessageListInitialized] =
        useState<boolean>(false);
    const [isProfileConfigured, setIsProfileConfigured] =
        useState<boolean>(false);
    const [showShimEffect, setShowShimEffect] = useState(false);

    const alias = ethAddress && ethAddress + globalConfig.ADDR_ENS_SUBDOMAIN();

    useEffect(() => {
        setIsMessageListInitialized(false);
        setIsProfileConfigured(
            selectedContact?.contactDetails.account.profile ? true : false,
        );
    }, [selectedContact]);

    const messages = useMemo(() => {
        if (!selectedContact?.contactDetails.account.ensName) {
            return [];
        }
        return getMessages(selectedContact?.contactDetails.account.ensName!);
    }, [selectedContact, getMessages]);

    // handles messages list
    useEffect(() => {
        const isLoading = contactIsLoading(
            selectedContact?.contactDetails.account.ensName!,
        );
        setShowShimEffect(isLoading);
    }, [contactIsLoading]);

    //@Bhupesh i suppose this effect was used to fetch messages of a newly added conversation
    /*     useEffect(() => {
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
                        () => {},
                        isMessageListInitialized,
                        updateIsMessageListInitialized,
                        updateShowShimEffect,
                        props.hideFunction,
                    );
                } catch (error) {
                    setShowShimEffect(false);
                    log(error, 'error');
                }
            }
        }, [state.modal.addConversation.active]); */

    /* shimmer effect contacts css */
    const shimmerData: number[] = Array.from({ length: 50 }, (_, i) => i + 1);

    console.log('eth address', account!.ensName);

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
                        {messages.length > 0 &&
                            messages.map(
                                (
                                    storageEnvelopContainer: MessageModel,
                                    index,
                                ) => (
                                    <div key={index} className="mt-2">
                                        <Message
                                            message={
                                                storageEnvelopContainer.envelop
                                                    .message.message ?? ''
                                            }
                                            time={
                                                storageEnvelopContainer.envelop.message.metadata?.timestamp.toString() ??
                                                '0'
                                            }
                                            messageState={
                                                storageEnvelopContainer.messageState
                                            }
                                            ownMessage={
                                                storageEnvelopContainer.envelop
                                                    .message.metadata?.from ===
                                                account!.ensName
                                            }
                                            envelop={
                                                storageEnvelopContainer.envelop
                                            }
                                            reactions={
                                                storageEnvelopContainer.reactions
                                            }
                                            replyToMessageEnvelop={
                                                storageEnvelopContainer.replyToMessageEnvelop
                                            }
                                        />
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
