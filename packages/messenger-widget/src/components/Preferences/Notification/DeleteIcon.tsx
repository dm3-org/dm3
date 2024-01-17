import './Notification.css';
import deleteIcon from '../../../assets/images/delete.svg';
import { VerificationMethod } from './bl';

interface IDeleteIcon {
    data: string;
    type: VerificationMethod;
    deleteNotification: Function;
}

export function DeleteIcon(props: IDeleteIcon) {
    return (
        <div className="d-flex align-items-center ms-5">
            <span className="highlighted-notification-data">{props.data}</span>
            <img
                className="ms-3 pointer-cursor"
                src={deleteIcon}
                alt="remove"
                onClick={() => {
                    props.deleteNotification();
                }}
            />
        </div>
    );
}
