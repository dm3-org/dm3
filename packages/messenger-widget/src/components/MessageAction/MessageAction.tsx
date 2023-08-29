import './MessageAction.css';
import editIcon from '../../assets/images/edit.svg';
import replyIcon from '../../assets/images/reply.svg';
import { MessageProps } from '../../interfaces/props';
import deleteIcon from '../../assets/images/chat-delete.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import {
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';

export function MessageAction(props: MessageProps) {
    const { dispatch } = useContext(GlobalContext);

    const setAction = (action: MessageActionType) => {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                messageData: props,
                actionType: action,
            },
        });
        if (action === MessageActionType.EDIT) {
            const element = document.getElementById('msg-input') as HTMLElement;
            if (element) {
                element.focus();
            }
        }
    };

    return (
        <div
            className={'msg-dropdown-content font-size-14 font-weight-400'.concat(
                ' ',
                props.ownMessage ? 'own-msg' : 'contact-msg',
            )}
        >
            {props.ownMessage && (
                <>
                    <div
                        className="d-flex align-items-center justify-content-start"
                        onClick={() => setAction(MessageActionType.EDIT)}
                    >
                        <img src={editIcon} alt="edit" className="me-2" />
                        Edit
                    </div>
                    <div className="d-flex align-items-center justify-content-start">
                        <img src={deleteIcon} alt="delete" className="me-2" />
                        Delete
                    </div>
                </>
            )}
            <div className="d-flex align-items-center justify-content-start">
                <img src={replyIcon} alt="delete" className="me-2" />
                Reply
            </div>
        </div>
    );
}
