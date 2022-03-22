import React, { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { AccountsType } from '../reducers/Accounts';
interface ContactListProps {
    contact: Lib.Account;
    connection: Lib.Connection;
}

function ContactListEntry(props: ContactListProps) {
    const [unreadMessages, setUnreadMessages] = useState<number>(0);
    const { state, dispatch } = useContext(GlobalContext);
    useEffect(() => {
        const calcUnreadMessages = () => {
            setUnreadMessages(
                Lib.getConversation(
                    props.contact.address,
                    state.connection,
                    state.userDb as Lib.UserDB,
                ).filter(
                    (container) =>
                        container.messageState === Lib.MessageState.Send,
                ).length,
            );
        };
        calcUnreadMessages();
    }, [props.contact, state.userDb?.conversations]);

    return (
        <button
            type="button"
            className="list-group-item list-group-item-action text-start"
            key={props.contact.address}
            onClick={() =>
                dispatch({
                    type: AccountsType.SetSelectedContact,
                    payload: props.contact,
                })
            }
        >
            {Lib.getAccountDisplayName(props.contact.address, state.ensNames)}{' '}
            {unreadMessages > 0 && (
                <span className="badge bg-secondary push-end messages-badge">
                    {unreadMessages}
                </span>
            )}
        </button>
    );
}

export default ContactListEntry;
