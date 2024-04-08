import './Notification.css';
import deleteIcon from '../../../assets/images/delete.svg';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { useContext } from 'react';
import { NotificationContext } from './Context';

interface IDeleteIcon {
    data: string;
    type: NotificationChannelType;
    deleteNotification: (action: null) => void;
}

export function DeleteIcon(props: IDeleteIcon) {
    const { removeSpecificNotificationChannel } =
        useContext(NotificationContext);

    return (
        <div className="notification-delete-container">
            <span className="highlighted-notification-data">{props.data}</span>
            <img
                className="ms-3 pointer-cursor"
                src={deleteIcon}
                alt="remove"
                onClick={() => {
                    removeSpecificNotificationChannel(
                        props.type,
                        props.deleteNotification,
                    );
                }}
            />
        </div>
    );
}
