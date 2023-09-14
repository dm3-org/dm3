import { useContext } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { MessageDataProps } from '../../interfaces/props';
import { handleSubmit } from '../MessageInputBox/bl';

export function MessageInputField(props: MessageDataProps) {
    const { state, dispatch } = useContext(GlobalContext);

    function setMessageContent(e: React.ChangeEvent<HTMLInputElement>) {
        // if message action is edit and message length is 0, update message action
        if (!e.target.value.length) {
            dispatch({
                type: UiViewStateType.SetMessageView,
                payload: {
                    actionType: MessageActionType.NONE,
                    messageData: undefined,
                },
            });
            props.setFiles([]);
        }
        props.setMessageText(e.target.value);
    }

    return (
        <form
            className="width-fill"
            onSubmit={(event) =>
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
        >
            <input
                id="msg-input"
                className="text-input-field width-fill height-fill text-primary-color 
            font-size-14 background-chat"
                value={props.message}
                type="text"
                autoComplete="off"
                placeholder="Write a message..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMessageContent(e)
                }
            ></input>
        </form>
    );
}
