import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { MessageModel } from '../../hooks/messages/useMessage';
import { HideFunctionProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';
import { Message } from '../Message/Message';
import { MessageInputBox } from '../MessageInputBox/MessageInputBox';
import './Chat.css';
import { scrollToBottomOfChat } from './scrollToBottomOfChat';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { TLDContext } from '../../context/TLDContext';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

export function Chat(props: HideFunctionProps) {
    const { state } = useContext(GlobalContext);
    const { account } = useContext(AuthContext);
    const { selectedContact, contacts, setSelectedContactName } =
        useContext(ConversationContext);
    const { screenWidth, dm3Configuration } = useContext(
        DM3ConfigurationContext,
    );
    const { getMessages, contactIsLoading } = useContext(MessageContext);

    const [isProfileConfigured, setIsProfileConfigured] =
        useState<boolean>(false);
    const [showShimEffect, setShowShimEffect] = useState(false);

    const { resolveTLDtoAlias } = useContext(TLDContext);

    useEffect(() => {
        if (!selectedContact) {
            return;
        }
        setIsProfileConfigured(
            !!selectedContact?.contactDetails.account.profile,
        );
    }, [selectedContact]);

    const [messages, setMessages] = useState<MessageModel[]>([]);

    //Some messages from the old storage might not have the alias resolved yet. We need to fetch them so they are not appearing as our own messages
    //It would be ideal to do this in useMessage but for now at least it works
    useEffect(() => {
        const messagesWithAlias = async () => {
            setShowShimEffect(true);
            if (!selectedContact?.contactDetails.account.ensName) {
                setShowShimEffect(false);
                return;
            }
            scrollToBottomOfChat();
            const messagesWithResolvedAlias = getMessages(
                selectedContact?.contactDetails.account.ensName!,
            );
            const messages = await Promise.all(
                messagesWithResolvedAlias.map(async (message) => {
                    return {
                        ...message,
                        envelop: {
                            ...message.envelop,
                            message: {
                                ...message.envelop.message,
                                metadata: {
                                    ...message.envelop.message.metadata,
                                    from: normalizeEnsName(
                                        await resolveTLDtoAlias(
                                            message.envelop.message.metadata
                                                ?.from ?? '',
                                        ),
                                    ),
                                },
                            },
                        },
                    };
                }),
            );
            setMessages(messages);
            setShowShimEffect(false);
        };
        messagesWithAlias();
    }, [selectedContact, getMessages]);

    // handles messages list
    useEffect(() => {
        const isLoading = contactIsLoading(
            selectedContact?.contactDetails.account.ensName!,
        );
        setShowShimEffect(isLoading);
    }, [contactIsLoading]);

    // if new message is found scroll based on message type
    useEffect(() => {
        if (
            messages.length &&
            (state.modal.lastMessageAction === MessageActionType.NONE ||
                state.modal.lastMessageAction === MessageActionType.REPLY ||
                state.modal.lastMessageAction === MessageActionType.NEW)
        ) {
            scrollToBottomOfChat();
        }
    }, [messages]);

    /**
     *  Load's default contact chat when contact list is not enabled
     **/
    useEffect(() => {
        if (!dm3Configuration.showContacts) {
            // set the default contact
            setSelectedContactName(dm3Configuration.defaultContact);

            // filter out the default contact from contact list
            const defContact = contacts.filter(
                (data) => data.name === dm3Configuration.defaultContact,
            );

            if (defContact.length) {
                // set the contact by its ensName found in contact list
                setSelectedContactName(
                    defContact[0].contactDetails.account.ensName,
                );
            }
        }
    }, []);

    /* shimmer effect contacts css */
    const shimmerData: number[] = Array.from({ length: 50 }, (_, i) => i + 1);

    return (
        <div
            id="chat-msgs"
            className={'chat-msgs width-fill '
                .concat(
                    selectedContact && screenWidth >= MOBILE_SCREEN_WIDTH
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
