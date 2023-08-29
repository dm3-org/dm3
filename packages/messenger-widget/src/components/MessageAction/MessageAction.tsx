import './MessageAction.css';
import editIcon from '../../assets/images/edit.svg';
import replyIcon from '../../assets/images/reply.svg';
import deleteIcon from '../../assets/images/chat-delete.svg';
import { MessageProps } from '../../interfaces/props';

export function MessageAction(props: MessageProps) {
    return (
        <div
            className={'msg-dropdown-content font-size-14 font-weight-400'.concat(
                ' ',
                props.ownMessage ? 'own-msg' : 'contact-msg',
            )}
        >
            {props.ownMessage && (
                <>
                    <div className="d-flex align-items-center justify-content-start">
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
