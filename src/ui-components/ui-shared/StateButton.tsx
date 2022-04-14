import React, { useContext } from 'react';
import Icon from '../ui-shared/Icon';

interface StateButtonProps {
    text: string;
    disabled?: boolean;
    onClick: () => void;
    btnType: 'primary' | 'secondary';
    btnState: ButtonState;
}

export enum ButtonState {
    Idel,
    Failed,
    Loading,
    Success,
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
            default:
                return null;
        }
    };

    const isDisabled = (btnState: ButtonState) => {
        switch (btnState) {
            case ButtonState.Failed:
                return false;
            case ButtonState.Loading:
                return true;
            case ButtonState.Success:
                return true;
            case ButtonState.Idel:
            default:
                return false;
        }
    };

    return (
        <button
            onClick={props.onClick}
            type="button"
            className={`btn btn-${
                props.btnState === ButtonState.Failed ? 'danger' : props.btnType
            } btn-lg w-100`}
            disabled={
                props.disabled !== undefined
                    ? props.disabled
                    : isDisabled(props.btnState)
            }
        >
            {props.text}
            {props.btnState !== ButtonState.Idel && (
                <span className="push-end">{getIcon(props.btnState)}</span>
            )}
        </button>
    );
}

export default StateButton;
