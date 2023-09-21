import './MessageAction.css';
import editIcon from '../../assets/images/edit.svg';
import replyIcon from '../../assets/images/reply.svg';
import { MessageProps } from '../../interfaces/props';
import deleteIcon from '../../assets/images/chat-delete.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import saveIcon from '../../assets/images/save.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    createNameForFile,
    getDependencies,
    getFileTypeFromBase64,
    getHaltDelivery,
    sendMessage,
} from '../../utils/common-utils';
import { SendDependencies, createReactionMessage } from 'dm3-lib-messaging';
import { hideMsgActionDropdown } from '../MessageInputBox/bl';

export function MessageAction(props: MessageProps) {
    const { state, dispatch } = useContext(GlobalContext);

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
        const userDb = state.userDb;

        if (!userDb) {
            throw Error('userDB not found');
        }

        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const filteredElements = props.reactions.filter(
            (data) => data.message.message === message,
        );

        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        if (filteredElements.length) {
            return;
        }

        const referenceMessageHash =
            props.envelop.metadata?.encryptedMessageHash;

        // react to the message
        const messageData = await createReactionMessage(
            state.accounts.selectedContact?.account.ensName as string,
            state.connection.account!.ensName,
            message,
            userDb.keys.signingKeyPair.privateKey as string,
            referenceMessageHash as string,
        );

        const haltDelivery = getHaltDelivery(state);
        const sendDependencies: SendDependencies = getDependencies(state);

        await sendMessage(
            state,
            sendDependencies,
            messageData,
            haltDelivery,
            dispatch,
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

    return (
        <div
            id="msg-dropdown"
            className={'msg-dropdown-content font-size-12 font-weight-400'.concat(
                ' ',
                props.ownMessage ? 'own-msg' : '',
            )}
        >
            {props.ownMessage && props.message && (
                <>
                    <div
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.EDIT)}
                    >
                        <img src={editIcon} alt="edit" className="me-2" />
                        Edit
                    </div>
                    <div
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.DELETE)}
                    >
                        <img src={deleteIcon} alt="delete" className="me-2" />
                        Delete
                    </div>
                </>
            )}
            {!props.ownMessage && (
                <div className="msg-reaction d-flex align-items-center justify-content-start p-0">
                    {reactionEmojis.map((item, index) => {
                        return (
                            <div
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

            {props.message && (
                <div
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
