import './Message.css';
import { useContext, useEffect, useState } from 'react';
import { MessageState } from 'dm3-lib-messaging';
import tickIcon from '../../assets/images/tick.svg';
import { HideFunctionProps, MessageProps } from '../../interfaces/props';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { MessageAction } from '../MessageAction/MessageAction';
import { GlobalContext } from '../../utils/context-utils';
import { MessageActionType } from '../../utils/enum-type-utils';
import DeleteMessage from '../DeleteMessage/DeleteMessage';
import { scrollToBottomOfChat } from '../Chat/bl';
import { Attachment } from '../../interfaces/utils';
import { AttachmentThumbnailPreview } from '../AttachmentThumbnailPreview/AttachmentThumbnailPreview';
import {
    deleteEmoji,
    getMessageChangeText,
    scrollToMessage,
    setFilesData,
} from './bl';

export function Message(props: MessageProps) {
    const { state, dispatch } = useContext(GlobalContext);

    // state to show action items three dots
    const [isHovered, setIsHovered] = useState(false);

    // attachments
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleMouseOver = () => {
        setIsHovered(true);
        if (props.isLastMessage) {
            scrollToBottomOfChat();
        }
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    function setAttachmentsData(data: Attachment[]) {
        setAttachments(data);
    }

    useEffect(() => {
        if (
            props.envelop.message.attachments &&
            props.envelop.message.attachments.length
        ) {
            setFilesData(props.envelop.message.attachments, setAttachmentsData);
        }
    }, [props]);

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
                                (!attachments || !attachments.length)
                                ? 'own-deleted-msg'
                                : state.uiView.selectedMessageView
                                    .actionType === MessageActionType.EDIT &&
                                    state.uiView.selectedMessageView.messageData
                                        ?.envelop.id === props.envelop.id
                                    ? 'msg-editing-active'
                                    : 'ms-3 background-config-box'
                            : !props.message &&
                                props.envelop.message.metadata.type ===
                                MessageActionType.DELETE &&
                                (!attachments || !attachments.length)
                                ? 'contact-deleted-msg'
                                : 'normal-btn-hover'
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
                    {props.replyToMsg &&
                        props.replyToMsgFrom &&
                        props.envelop.message.metadata.type ===
                        MessageActionType.REPLY && (
                            <div
                                className="reply-preview d-flex border-radius-4 normal-btn-inactive pointer-cursor"
                                onClick={() =>
                                    scrollToMessage(
                                        props.replyToMsgId as string,
                                    )
                                }
                            >
                                <div className="user-name">
                                    {props.replyToMsgFrom.length > 25
                                        ? props.replyToMsgFrom
                                            .substring(0, 25)
                                            .concat(': ')
                                        : props.replyToMsgFrom.concat(':')}
                                </div>
                                {props.replyToMsg
                                    .substring(0, 20)
                                    .concat('...')}
                            </div>
                        )}

                    {/* Attachments preview */}
                    {attachments.length > 0 &&
                        props.envelop.message.metadata.type !==
                        MessageActionType.DELETE && (
                            <AttachmentThumbnailPreview
                                filesSelected={attachments}
                                isMyMessage={props.ownMessage}
                            />
                        )}

                    {/* actual message */}
                    {props.message
                        ? props.message
                        : attachments.length > 0 &&
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
                        (!props.message && attachments.length) === 0 ||
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
                                            deleteEmoji(
                                                item,
                                                props,
                                                state,
                                                dispatch,
                                            );
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
