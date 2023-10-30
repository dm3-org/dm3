import './ReplyMessagePreview.css';
import { useContext } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { ReplyMessagePreviewProps } from '../../interfaces/props';

export function ReplyMessagePreview(props: ReplyMessagePreviewProps) {
    const { state, dispatch } = useContext(GlobalContext);

    function cancelReply() {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                messageData: undefined,
                actionType: MessageActionType.NONE,
            },
        });
        props.setFiles([]);
    }

    return (
        <div
            className="reply-content text-primary-color background-config-box font-size-14 
font-weight-400 d-flex justify-content-between"
        >
            <div className="user-name">
                {
                    state.uiView.selectedMessageView.messageData?.envelop
                        .message.metadata.from
                }
                :
                <div className="text-primary-color">
                    {' ' +
                        state.uiView.selectedMessageView.messageData?.message
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
