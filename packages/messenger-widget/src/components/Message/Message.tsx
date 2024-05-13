import './Message.css';
import { useContext } from 'react';
import { MessageProps } from '../../interfaces/props';
import { MessageActionType } from '../../utils/enum-type-utils';
import { AttachmentThumbnailPreview } from '../AttachmentThumbnailPreview/AttachmentThumbnailPreview';
import {
    getFilesAttachments,
    getMessageReactionStyleClassses,
    getMessageStyleClasses,
} from './bl';
import { UiViewContext } from '../../context/UiViewContext';
import { ReplyMessagePreview } from './ReplyMessagePreview';
import { MessageReactions } from './MessageReactions';
import { Action } from './Action';
import { MessageDetail } from './MessageDetail';

export function Message(props: MessageProps) {
    const { messageView } = useContext(UiViewContext);

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
                <div className={getMessageStyleClasses(props, messageView)}>
                    {/* Reply message preview */}
                    <ReplyMessagePreview {...props} />

                    {/* Attachments preview */}
                    {props.envelop.message.attachments &&
                        props.envelop.message.attachments.length > 0 &&
                        props.envelop.message.metadata.type !==
                            MessageActionType.DELETE && (
                            <AttachmentThumbnailPreview
                                filesSelected={getFilesAttachments(
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
                {/* action 3 dots */}
                <Action {...props} />
            </div>

            <div className={getMessageReactionStyleClassses(props)}>
                {/* Own message */}
                {props.ownMessage && <MessageDetail {...props} />}

                {/* Reaction emojis */}
                <MessageReactions {...props} />

                {/* Contact's message */}
                {!props.ownMessage && <MessageDetail {...props} />}
            </div>
        </span>
    );
}
