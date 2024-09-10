import './Notification.css';

export interface INotificationButton {
    text: string;
    action: Function;
    disabled: boolean;
}

export function NotificationButton(props: INotificationButton) {
    return (
        <button
            className={'notification-btn'.concat(
                ' ',
                props.disabled
                    ? 'notification-btn-disabled'
                    : 'notification-btn-enabled',
            )}
            disabled={props.disabled}
            onClick={() => props.action()}
        >
            {props.text}
        </button>
    );
}
