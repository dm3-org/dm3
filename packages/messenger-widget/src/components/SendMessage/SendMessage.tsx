import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';

export function SendMessage(props: MessageDataProps) {
    const { state, dispatch } = useContext(GlobalContext);

    function submit(event: React.MouseEvent<HTMLImageElement, MouseEvent>) {
        const files = props.filesSelected;
        const msg = props.message;
        props.setMessageText('');
        props.setFiles([]);
        handleSubmit(msg, state, dispatch, event, files);
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
