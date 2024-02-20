import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { MessageModel } from '../../hooks/messages/useMessage';
import { HideFunctionProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';
import { Message } from '../Message/Message';
import { MessageInputBox } from '../MessageInputBox/MessageInputBox';
import './Chat.css';
import { scrollToBottomOfChat } from './scrollToBottomOfChat';

export function Chat(props: HideFunctionProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { ethAddress, deliveryServiceToken, account } =
        useContext(AuthContext);
    const { selectedContact } = useContext(ConversationContext);
    const { getMessages, contactIsLoading } = useContext(MessageContext);
    const mainnetProvider = useMainnetProvider();

    const [isProfileConfigured, setIsProfileConfigured] =
        useState<boolean>(false);
    const [showShimEffect, setShowShimEffect] = useState(false);

    useEffect(() => {
        if (!selectedContact) {
            dispatch({
                type: UiViewStateType.SetSelectedRightView,
                payload: RightViewSelected.Default,
            });
            return;
        }
        setIsProfileConfigured(
            !!selectedContact?.contactDetails.account.profile,
        );
    }, [selectedContact]);

    const messages = useMemo(() => {
        if (!selectedContact?.contactDetails.account.ensName) {
            return [];
        }
        scrollToBottomOfChat();
        return getMessages(selectedContact?.contactDetails.account.ensName!);
    }, [selectedContact, getMessages]);

    // handles messages list
    useEffect(() => {
        const isLoading = contactIsLoading(
            selectedContact?.contactDetails.account.ensName!,
        );
        setShowShimEffect(isLoading);
    }, [contactIsLoading]);

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
