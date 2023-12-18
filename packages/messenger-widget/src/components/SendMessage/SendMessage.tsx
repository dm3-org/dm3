import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';
import { AuthContext } from '../../context/AuthContext';

export function SendMessage(props: MessageDataProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { account, deliveryServiceToken } = useContext(AuthContext);

    function submit(event: React.MouseEvent<HTMLImageElement, MouseEvent>) {
        const files = props.filesSelected;
        const msg = props.message;
        handleSubmit(
            deliveryServiceToken!,
            msg,
            state,
            account!,
            dispatch,
            event,
            files,
            props.setMessageText,
            props.setFiles,
        );
    }

    return (
        <span className="d-flex align-items-center pointer-cursor text-secondary-color">
            <img
                className="chat-svg-icon"
                src={sendBtnIcon}
                alt="send"
                onClick={(
                    event: React.MouseEvent<HTMLImageElement, MouseEvent>,
                ) => submit(event)}
            />
        </span>
    );
}
