import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';

export function SendMessage(props: MessageDataProps) {
    const { state, dispatch } = useContext(GlobalContext);

    return (
        <span className="d-flex align-items-center pointer-cursor text-secondary-color">
            <img
                className="chat-svg-icon"
                src={sendBtnIcon}
                alt="send"
                onClick={(
                    event: React.MouseEvent<HTMLImageElement, MouseEvent>,
                ) =>
                    handleSubmit(
                        props.message,
                        state,
                        dispatch,
                        props.setMessageText,
                        event,
                        props.filesSelected,
                        props.setFiles,
                    )
                }
            />
        </span>
    );
}
