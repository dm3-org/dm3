import './Notification.css';

export interface ICheckbox {
    checked: boolean;
    disabled: boolean;
    action: Function;
    heading: string;
}

export interface IText {
    text: string;
    disabled: boolean;
}

export function Checkbox(props: ICheckbox) {
    return (
        <div className="d-flex">
            <label
                className={
                    props.disabled
                        ? 'checkbox-container-disabled'
                        : 'checkbox-container'
                }
            >
                <input
                    type="checkbox"
                    disabled={props.disabled}
                    checked={props.disabled ? true : props.checked}
                    onChange={(e) => {
                        props.action(e.target.checked ? true : false);
                    }}
                />
                <span
                    className={
                        props.disabled ? 'checkmark-disabled' : 'checkmark'
                    }
                ></span>
            </label>
            <span
                className={'notification-heading'.concat(
                    ' ',
                    props.disabled ? 'disabled-content' : '',
                )}
            >
                {props.heading}
            </span>
        </div>
    );
}

export function Text(props: IText) {
    return (
        <div
            className={'d-flex notification-text'.concat(
                ' ',
                props.disabled ? 'disabled-content' : '',
            )}
        >
            {props.text}
        </div>
    );
}
