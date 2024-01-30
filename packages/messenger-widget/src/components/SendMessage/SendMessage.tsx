/* eslint-disable max-len */
import { MessageDataProps } from '../../interfaces/props';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import { GlobalContext } from '../../utils/context-utils';
import { useContext } from 'react';
import { handleSubmit } from '../MessageInputBox/bl';
import { AuthContext } from '../../context/AuthContext';
import { StorageContext } from '../../context/StorageContext';
import { Message } from '@dm3-org/dm3-lib-messaging';

export function SendMessage(props: MessageDataProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const { storeMessage } = useContext(StorageContext);
    const { account, deliveryServiceToken } = useContext(AuthContext);

    async function submit(
        event: React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) {
        const files = props.filesSelected;
        const msg = props.message;

        const xxx: Message = {
            attachments: [],
            message: 'lplp',
            metadata: {
                from: '0x99C19AB10b9EC8aC6fcda9586E81f6B73a298870.addr.dm3.eth',
                timestamp: 1706084571962,
                to: 'help.dm3.eth',
                type: 'NEW',
            },
            signature:
                'LzwsANn9OcBO2m0tg/iQvgJi28ILJeEONG+gXiw9PWsNV/IavpIMBshb+fbgxaOn9rwDbjn9UMGtczQLJZQ7Bw==',
        };

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
