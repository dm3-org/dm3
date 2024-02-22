import {
    Envelop,
    MessageState,
    createDeleteRequestMessage,
} from '@dm3-org/dm3-lib-messaging';
import { useContext, useState } from 'react';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import tickIcon from '../../assets/images/tick.svg';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { MessageProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { AttachmentThumbnailPreview } from '../AttachmentThumbnailPreview/AttachmentThumbnailPreview';
import { MessageAction } from '../MessageAction/MessageAction';
import './Message.css';
import { getFilesData, getMessageChangeText, scrollToMessage } from './bl';

export function Message(props: MessageProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { account, profileKeys } = useContext(AuthContext);
    const { addMessage } = useContext(MessageContext);
    const { selectedContact } = useContext(ConversationContext);

    // state to show action items three dots
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    const deleteEmoji = async (deleteEmojiData: Envelop) => {
        /**
         * User can't remove reactions on his own messages.
         * As the other account can only react to my messages.
         * And only that other account can remove those reactions.
         **/
        if (props.ownMessage) {
            return;
        }

        if (!selectedContact) {
            throw Error('no contact selected');
        }

        const messageHash = deleteEmojiData.metadata?.encryptedMessageHash;

        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        // delete the message
        const messageData = await createDeleteRequestMessage(
            selectedContact?.contactDetails.account.ensName,
            account!.ensName,
            profileKeys!.signingKeyPair.privateKey,
            messageHash!,
        );

        await addMessage(messageData.metadata.to, messageData);

        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.NONE,
        });
    };

    return (
        <span
            id={props.envelop.metadata?.encryptedMessageHash}
            className={'text-primary-color d-grid msg'.concat(
                ' ',
                props.ownMessage
                    ? 'me-2 justify-content-end'
                    : 'ms-2 justify-content-start',
            )}
        >
            <div className="d-flex">
                <div
                    className={'width-fill text-left font-size-14 border-radius-6 content-style'.concat(
                        ' ',
                        (props.ownMessage
                            ? !props.message &&
                              props.envelop.message.metadata.type ===
                                  MessageActionType.DELETE &&
                              (!props.envelop.message.attachments ||
                                  props.envelop.message.attachments.length < 1)
                                ? 'own-deleted-msg'
                                : state.uiView.selectedMessageView
                                      .actionType === MessageActionType.EDIT &&
                                  state.uiView.selectedMessageView.messageData
                                      ?.envelop.message.signature ===
                                      props.envelop.message.signature
                                ? 'msg-editing-active'
                                : 'ms-3 own-msg-background'
                            : !props.message &&
                              props.envelop.message.metadata.type ===
                                  MessageActionType.DELETE &&
                              (!props.envelop.message.attachments ||
                                  props.envelop.message.attachments.length < 1)
                            ? 'contact-deleted-msg'
                            : 'contact-msg-background'
                        ).concat(
                            ' ',
                            props.reactions.length > 0
                                ? props.ownMessage
                                    ? 'own-reacted-msg'
                                    : 'contact-reacted-msg'
                                : '',
                        ),
                    )}
                >
                    {/* show the preview of reply message */}
                    {props.replyToMessageEnvelop &&
                        props.envelop.message.metadata.type ===
                            MessageActionType.REPLY && (
                            <div
                                className={'reply-preview d-flex border-radius-4 pointer-cursor'.concat(
                                    props.ownMessage
                                        ? ' reply-preview-own'
                                        : ' reply-preview-contact',
                                )}
                                onClick={() =>
                                    scrollToMessage(
                                        props.replyToMessageEnvelop?.metadata
                                            ?.encryptedMessageHash!,
                                    )
                                }
                            >
                                <AttachmentThumbnailPreview
                                    filesSelected={getFilesData(
                                        props.replyToMessageEnvelop?.message
                                            .attachments as string[],
                                    )}
                                    isMyMessage={props.ownMessage}
                                    isReplyMsgAttachments={true}
                                />
                                <div className="user-name">
                                    {props.replyToMessageEnvelop.message
                                        .metadata.from.length > 25
                                        ? props.replyToMessageEnvelop.message.metadata.from
                                              .substring(0, 25)
                                              .concat(': ')
                                        : props.replyToMessageEnvelop.message.metadata.from.concat(
                                              ':',
                                          )}
                                </div>
                                {props.replyToMessageEnvelop.message.message
                                    ? props.replyToMessageEnvelop.message.message
                                          .substring(0, 20)
                                          .concat('...')
                                    : ''}
                            </div>
                        )}

                    {/* Attachments preview */}
                    {props.envelop.message.attachments &&
                        props.envelop.message.attachments.length > 0 &&
                        props.envelop.message.metadata.type !==
                            MessageActionType.DELETE && (
                            <AttachmentThumbnailPreview
                                filesSelected={getFilesData(
                                    props.envelop.message.attachments,
                                )}
                                isMyMessage={props.ownMessage}
                            />
                        )}

                    {/* actual message */}
                    {props.message
                        ? props.message
                        : props.envelop.message.attachments &&
                          props.envelop.message.attachments.length > 0 &&
                          props.envelop.message.metadata.type !==
                              MessageActionType.DELETE
                        ? ''
                        : props.ownMessage
                        ? 'You deleted this message.'
                        : 'This message was deleted.'}
                </div>
                {/* action item */}
                <div
                    className={'msg-action-container d-flex pointer-cursor border-radius-3 position-relative'.concat(
                        ' ',
                        (!props.message &&
                            props.envelop.message.attachments &&
                            props.envelop.message.attachments.length) === 0 ||
                            props.envelop.message.metadata.type ===
                                MessageActionType.DELETE ||
                            !props.envelop.metadata?.encryptedMessageHash
                            ? 'hide-action'
                            : '',
                    )}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseOut}
                >
                    <img
                        className="msg-action-dot"
                        src={threeDotsIcon}
                        alt="action"
                    />
                    {isHovered && <MessageAction {...props} />}
                </div>
            </div>

            <div
                className={'d-flex justify-content-end text-secondary-color time-style'.concat(
                    ' ',
                    props.reactions.length > 0
                        ? !props.ownMessage
                            ? 'justify-content-between'
                            : 'ms-3 justify-content-end'
                        : props.ownMessage
                        ? 'ms-3'
                        : '',
                )}
            >
                {/* Own message */}
                {props.ownMessage && (
                    <div className="d-flex justify-content-end pt-1 ps-1 pe-1">
                        {getMessageChangeText(props)}
                        {new Date(Number(props.time)).toLocaleString()}

                        {/* readed message tick indicator */}
                        <span className="tick-icon readed-tick-icon">
                            {props.messageState === MessageState.Read ? (
                                <>
                                    <img src={tickIcon} alt="read" />
                                    <img
                                        src={tickIcon}
                                        alt="read"
                                        className="second-tick"
                                    />
                                </>
                            ) : (
                                <img src={tickIcon} alt="read" />
                            )}
                        </span>
                    </div>
                )}

                {/* Reaction emojis */}
                {props.reactions.length > 0 && (
                    <div
                        className={'reacted d-flex'.concat(
                            ' ',
                            props.ownMessage
                                ? 'background-config-box'
                                : 'normal-btn-hover',
                        )}
                    >
                        {props.reactions.map((item, index) => {
                            return (
                                item.message.message && (
                                    <div
                                        key={index}
                                        className="pointer-cursor"
                                        onClick={() => {
                                            deleteEmoji(item);
                                        }}
                                    >
                                        {item.message.message}
                                    </div>
                                )
                            );
                        })}
                    </div>
                )}

                {/* Contact's message */}
                {!props.ownMessage && (
                    <div className="d-flex justify-content-end pt-1 ps-1 pe-1">
                        {getMessageChangeText(props)}
                        {new Date(Number(props.time)).toLocaleString()}
                        {/* readed message tick indicator */}
                        <span className="tick-icon readed-tick-icon">
                            <img src={tickIcon} alt="read" />
                        </span>
                    </div>
                )}
            </div>
        </span>
    );
}
