import './EmojiModal.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { EmojiProps, MessageProps } from '../../interfaces/props';
import { useRef, useEffect, useContext } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    createReactionMessage,
    Envelop,
    SendDependencies,
} from 'dm3-lib-messaging';
import {
    getHaltDelivery,
    getDependencies,
    sendMessage,
} from '../../utils/common-utils';
import { hideMsgActionDropdown } from '../MessageInputBox/bl';
import { AuthContext } from '../../context/AuthContext';

export function EmojiModal(props: EmojiProps) {
    const emojiRef: any = useRef();

    const { state, dispatch } = useContext(GlobalContext);

    const { account, deliveryServiceToken } = useContext(AuthContext);

    // handles mouse click outside of emoji modal and closes the modal automatically
    const handleClickOutside = (e: { target: any }) => {
        if (e.target && e.target.id === 'emoji-modal-handler') {
            // don't close the popup when clicked on emoji modal opener
            return;
        } else if (emojiRef.current && !emojiRef.current.contains(e.target)) {
            // close the popup when clicked outside
            dispatch({
                type: ModalStateType.OpenEmojiPopup,
                payload: { action: false, data: undefined },
            });
        }
    };

    // Handles emoji selection in normal message or as a message reaction
    const handleEmojiSelect = async (data: string) => {
        let messageData: MessageProps;
        // emoji reaction
        if (
            state.modal.openEmojiPopup.action &&
            state.modal.openEmojiPopup.data
        ) {
            messageData = state.modal.openEmojiPopup.data as MessageProps;
            dispatch({
                type: ModalStateType.OpenEmojiPopup,
                payload: { action: false, data: undefined },
            });
            setAction();
            await reactToMessage(data, messageData);
        } else {
            // normal message contianing emoji
            props.setMessage(props.message.concat(data));
        }
    };

    const setAction = () => {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                messageData: undefined,
                actionType: MessageActionType.REACT,
            },
        });
        hideMsgActionDropdown();
    };

    const reactToMessage = async (message: string, props: MessageProps) => {
        const userDb = state.userDb;

        if (!userDb) {
            throw Error('userDB not found');
        }

        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const filteredElements = props.reactions.filter(
            (data: Envelop) => data.message.message === message,
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
            account!.ensName,
            message,
            userDb.keys.signingKeyPair.privateKey as string,
            referenceMessageHash as string,
        );

        const haltDelivery = getHaltDelivery(state);
        const sendDependencies: SendDependencies = getDependencies(
            state,
            account!,
        );

        await sendMessage(
            account!,
            deliveryServiceToken!,
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

    // handles click on outside of emoji modal to autoclose the modal
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <>
            {
                <div className="emoji-modal-container" ref={emojiRef}>
                    <Picker
                        data={data}
                        previewPosition="none"
                        theme="dark"
                        searchPosition="none"
                        autoFocus={false}
                        onEmojiSelect={(data: any) =>
                            handleEmojiSelect(data.native)
                        }
                    />
                </div>
            }
        </>
    );
}
