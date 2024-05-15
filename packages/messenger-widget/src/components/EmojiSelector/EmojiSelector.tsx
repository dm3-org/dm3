import { useContext } from 'react';
import emojiIcon from '../../assets/images/emoji.svg';
import { ModalContext } from '../../context/ModalContext';

export function EmojiSelector() {
    const { setOpenEmojiPopup, openEmojiPopup } = useContext(ModalContext);

    return (
        <span className="d-flex smile-icon">
            <img
                data-testid="emoji-modal-handler"
                id="emoji-modal-handler"
                className="chat-svg-icon pointer-cursor"
                src={emojiIcon}
                alt="emoji"
                onClick={() => {
                    setOpenEmojiPopup({
                        action: !openEmojiPopup.action,
                        data: undefined,
                    });
                }}
            />
        </span>
    );
}
