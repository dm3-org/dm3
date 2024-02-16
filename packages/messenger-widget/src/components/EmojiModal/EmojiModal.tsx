import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { EmojiProps, MessageProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { hideMsgActionDropdown } from '../MessageInputBox/bl';
import './EmojiModal.css';

export function EmojiModal(props: EmojiProps) {
    const emojiRef: any = useRef();

    const { state, dispatch } = useContext(GlobalContext);

    const { account, deliveryServiceToken } = useContext(AuthContext);
    const { selectedContact } = useContext(ConversationContext);

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
        //TODO add onSubmit similar to reactions

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
