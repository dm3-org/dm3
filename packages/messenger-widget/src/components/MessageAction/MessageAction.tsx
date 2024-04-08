import { createReactionMessage } from '@dm3-org/dm3-lib-messaging';
import { useContext, useEffect, useState } from 'react';
import deleteIcon from '../../assets/images/chat-delete.svg';
import editIcon from '../../assets/images/edit.svg';
import replyIcon from '../../assets/images/reply.svg';
import saveIcon from '../../assets/images/save.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { MessageProps } from '../../interfaces/props';
import {
    MOBILE_SCREEN_WIDTH,
    createNameForFile,
    getFileTypeFromBase64,
} from '../../utils/common-utils';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { hideMsgActionDropdown } from '../MessageInputBox/bl';
import './MessageAction.css';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function MessageAction(props: MessageProps) {
    const { dispatch } = useContext(GlobalContext);
    const { account, profileKeys } = useContext(AuthContext);
    const { addMessage } = useContext(MessageContext);
    const { selectedContact } = useContext(ConversationContext);
    const { screenWidth } = useContext(DM3ConfigurationContext);

    const [alignmentTop, setAlignmentTop] = useState(false);

    // Popular emojis for reaction
    const reactionEmojis = ['🙂', '👍', '👎', '❤️'];

    const reactedWithEmoji = async (emoji: string) => {
        // directly react to the message with selected emoji
        if (emoji !== 'more') {
            setAction(MessageActionType.REACT);
            await reactToMessage(emoji);
        } else {
            // open the emoji modal for more emojis
            dispatch({
                type: ModalStateType.OpenEmojiPopup,
                payload: { action: true, data: props },
            });
            hideMsgActionDropdown();
        }
    };

    const setAction = (action: MessageActionType) => {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                messageData: props,
                actionType: action,
            },
        });
        hideMsgActionDropdown();
    };

    const reactToMessage = async (message: string) => {
        if (!selectedContact) {
            throw Error('no contact selected');
        }

        // Filters if the reaction already exists
        const filteredReactions = props.reactions.filter(
            (data) => data.message.message === message,
        );

        // if same reaction already exists, then it should not be added again so returns
        if (filteredReactions.length) {
            return;
        }

        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        const referenceMessageHash =
            props.envelop.metadata?.encryptedMessageHash;

        // react to the message
        const messageData = await createReactionMessage(
            selectedContact.contactDetails.account.ensName as string,
            account!.ensName,
            message,
            profileKeys?.signingKeyPair.privateKey!,
            referenceMessageHash as string,
        );

        await addMessage(
            selectedContact?.contactDetails.account.ensName!,
            messageData,
        );

        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.REACT,
        });
    };

    // download all the attachments in the message
    const saveAttachments = () => {
        hideMsgActionDropdown();
        if (props.envelop.message.attachments) {
            const link = document.createElement('a');
            props.envelop.message.attachments.forEach((base64, index) => {
                link.href = base64;
                link.download = createNameForFile(
                    index,
                    getFileTypeFromBase64(base64),
                );
                link.click();
            });
        }
    };

    const setDropdownPosition = () => {
        const inputElement = document.getElementById('msg-input-box-container');
        const actionElement = document.getElementById('msg-dropdown');
        if (inputElement && actionElement) {
            const inputProperties = inputElement.getBoundingClientRect();
            const actionProperties = actionElement.getBoundingClientRect();
            if (
                inputProperties.top - actionProperties.top <
                actionProperties.height
            ) {
                setAlignmentTop(true);
            } else {
                setAlignmentTop(false);
            }
        } else {
            setAlignmentTop(false);
        }
    };

    useEffect(() => {
        setDropdownPosition();
    }, []);

    return (
        <div
            id="msg-dropdown"
            className={'msg-dropdown-content font-size-12 font-weight-400'
                .concat(' ', props.ownMessage ? 'own-msg' : '')
                .concat(' ', alignmentTop ? 'align-top' : '')
                .concat(
                    ' ',
                    !props.ownMessage && screenWidth <= MOBILE_SCREEN_WIDTH
                        ? 'align-action-item-left'
                        : '',
                )}
        >
            {props.ownMessage &&
                (props.message ||
                    (props.envelop.message.attachments &&
                        props.envelop.message.attachments.length)) &&
                props.envelop.metadata?.encryptedMessageHash &&
                (!props.hideFunction ||
                    !props.hideFunction.split(',').includes('edit')) && (
                    <div
                        data-testid="edit-msg"
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.EDIT)}
                    >
                        <img src={editIcon} alt="edit" className="me-2" />
                        Edit
                    </div>
                )}

            {props.ownMessage &&
                props.envelop.metadata?.encryptedMessageHash &&
                (!props.hideFunction ||
                    !props.hideFunction.split(',').includes('delete')) && (
                    <div
                        data-testid="delete-msg"
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.DELETE)}
                    >
                        <img src={deleteIcon} alt="delete" className="me-2" />
                        Delete
                    </div>
                )}

            {!props.ownMessage && (
                <div className="msg-reaction d-flex align-items-center justify-content-start p-0">
                    {reactionEmojis.map((item, index) => {
                        return screenWidth <= MOBILE_SCREEN_WIDTH ? (
                            index < 2 && (
                                <div
                                    data-testid={`reaction-emoji-${index}`}
                                    className="msg-reaction-container"
                                    onClick={() => reactedWithEmoji(item)}
                                    key={index}
                                >
                                    {item}
                                </div>
                            )
                        ) : (
                            <div
                                data-testid={`reaction-emoji-${index}`}
                                className="msg-reaction-container"
                                onClick={() => reactedWithEmoji(item)}
                                key={index}
                            >
                                {item}
                            </div>
                        );
                    })}
                    <img
                        src={threeDotsIcon}
                        alt="more"
                        className="msg-reaction-container"
                        onClick={() => reactedWithEmoji('more')}
                    />
                </div>
            )}

            {!props.ownMessage && (
                <hr className="line-separator msg-react-separator" />
            )}

            {(props.message ||
                (props.envelop.message.attachments &&
                    props.envelop.message.attachments.length)) &&
                props.envelop.metadata?.encryptedMessageHash && (
                    <div
                        data-testid="reply-msg"
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.REPLY)}
                    >
                        <img src={replyIcon} alt="delete" className="me-2" />
                        Reply
                    </div>
                )}

            {props.envelop.message.attachments &&
                props.envelop.message.attachments.length > 0 && (
                    <div
                        data-testid="attachments-msg"
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => saveAttachments()}
                    >
                        <img src={saveIcon} alt="save" className="me-2" />
                        Save attachments
                    </div>
                )}
        </div>
    );
}
