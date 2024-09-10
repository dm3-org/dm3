import './ReplyMessagePreview.css';
import { useContext } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { MessageActionType } from '../../utils/enum-type-utils';
import { ReplyMessagePreviewProps } from '../../interfaces/props';
import { UiViewContext } from '../../context/UiViewContext';

export function ReplyMessagePreview(props: ReplyMessagePreviewProps) {
    const { messageView, setMessageView } = useContext(UiViewContext);

    const fromAddress = messageView.messageData?.envelop.message.metadata
        .from as string;

    function cancelReply() {
        setMessageView({
            actionType: MessageActionType.NONE,
            messageData: undefined,
        });
        props.setFiles([]);
    }

    return (
        <div
            className="reply-content text-primary-color background-config-box font-size-14 
font-weight-400 d-flex justify-content-between"
        >
            <div className="user-name">
                {fromAddress}:
                <div className="text-primary-color">
                    {' ' +
                        messageView.messageData?.message
                            .substring(0, 20)
                            .concat('...')}
                </div>
            </div>
            <img
                className="reply-close-icon pointer-cursor"
                src={closeIcon}
                alt="close"
                onClick={() => cancelReply()}
            />
        </div>
    );
}
