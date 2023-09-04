import './EmojiModal.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { EmojiProps } from '../../interfaces/props';
import { useState, useRef, useEffect } from 'react';

export function EmojiModal(props: EmojiProps) {
    const emojiRef: any = useRef();

    const [clickedOutside, setClickedOutside] = useState(false);

    // handles mouse click outside of emoji modal and closes the modal automatically
    const handleClickOutside = (e: { target: any }) => {
        if (emojiRef.current && !emojiRef.current.contains(e.target)) {
            setClickedOutside(true);
            props.setOpenEmojiPopup(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <>
            {!clickedOutside && (
                <div className="emoji-modal-container" ref={emojiRef}>
                    <Picker
                        data={data}
                        previewPosition="none"
                        theme="dark"
                        searchPosition="none"
                        autoFocus={false}
                        onEmojiSelect={(data: any) =>
                            props.setMessage(props.message.concat(data.native))
                        }
                    />
                </div>
            )}
        </>
    );
}
