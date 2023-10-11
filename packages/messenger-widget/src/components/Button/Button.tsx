import { IButton } from '../../interfaces/utils';

export function Button(props: IButton) {
    return (
        <button
            className="common-btn font-weight-400 border-radius-4 normal-btn text-primary-color normal-btn-border"
            onClick={() => props.actionMethod()}
        >
            {props.buttonText}
        </button>
    );
}
