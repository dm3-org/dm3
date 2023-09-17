import { useContext } from 'react';
import emojiIcon from '../../assets/images/emoji.svg';
import { GlobalContext } from '../../utils/context-utils';
import { ModalStateType } from '../../utils/enum-type-utils';

export function EmojiSelector() {
    const { state, dispatch } = useContext(GlobalContext);

    return (
        <span className="d-flex smile-icon">
            <img
                id="emoji-modal-handler"
                className="chat-svg-icon pointer-cursor"
                src={emojiIcon}
                alt="emoji"
                onClick={() => {
                    dispatch({
                        type: ModalStateType.OpenEmojiPopup,
                        payload: {
                            action: !state.modal.openEmojiPopup.action,
                            data: undefined,
                        },
                    });
                }}
            />
        </span>
    );
}
