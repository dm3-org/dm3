import React, { useContext } from 'react';
import Icon from '../ui-shared/Icon';

interface StateButtonProps {
    content: JSX.Element;
    disabled?: boolean;
    onClick: () => void;
    btnType: 'primary' | 'secondary';
    btnState: ButtonState;
    className?: string;
}

export enum ButtonState {
    Idel,
    Failed,
    Loading,
    Success,
    Disabled,
}

function StateButton(props: StateButtonProps) {
    const getIcon = (btnState: ButtonState) => {
        switch (btnState) {
            case ButtonState.Failed:
                return <Icon iconClass="fas fa-exclamation-circle" />;
            case ButtonState.Loading:
                return <Icon iconClass="fas fa-spinner fa-spin" />;
            case ButtonState.Success:
                return <Icon iconClass="fas fa-check-circle" />;
            case ButtonState.Idel:
            case ButtonState.Disabled:
            default:
                return null;
        }
    };

    const isDisabled = (btnState: ButtonState) => {
        switch (btnState) {
            case ButtonState.Disabled:
            case ButtonState.Loading:
            case ButtonState.Success:
                return true;

            case ButtonState.Failed:
            case ButtonState.Idel:
            default:
                return false;
        }
    };

    return (
        <button
            onClick={props.onClick}
            type="button"
            className={`state-btn btn-${
                props.btnState === ButtonState.Failed ? 'danger' : props.btnType
            } btn-lg w-100 ${props.className ? props.className : ''}`}
            disabled={
                props.disabled !== undefined
                    ? props.disabled
                    : isDisabled(props.btnState)
            }
        >
            {props.content}
            {props.btnState !== ButtonState.Idel && (
                <span className="push-end">{getIcon(props.btnState)}</span>
            )}
        </button>
    );
}

export default StateButton;
