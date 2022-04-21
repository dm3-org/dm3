import React, { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { AccountsType } from '../reducers/Accounts';
import Avatar from '../ui-shared/Avatar';
import { AccountInfo } from '../reducers/shared';

interface ContactListProps {
    contact: Lib.Account;
    connection: Lib.Connection;
}

function ContactListEntry(props: ContactListProps) {
    const [unreadMessages, setUnreadMessages] = useState<number>(0);
    const [teaser, setTeaser] = useState<string | undefined>();
    const { state, dispatch } = useContext(GlobalContext);
    useEffect(() => {
        const messages = Lib.getConversation(
            props.contact.address,
            state.connection,
            state.userDb as Lib.UserDB,
        );
        const calcUnreadMessages = () => {
            setUnreadMessages(
                messages.filter(
                    (container) =>
                        container.messageState === Lib.MessageState.Send,
                ).length,
            );
        };
        calcUnreadMessages();

        if (messages.length > 0) {
            const message =
                messages[messages.length - 1].envelop.message.message;
            setTeaser(
                message.slice(0, 25) + (message.length > 25 ? '...' : ''),
            );
        }
    }, [props.contact, state.userDb?.conversations]);

    return (
        <div
            className="list-group-item list-group-item-action contact-entry d-flex justify-content-between"
            key={props.contact.address}
            onClick={() => {
                dispatch({
                    type: AccountsType.SetSelectedContact,
                    payload: props.contact,
                });
                dispatch({
                    type: AccountsType.SetAccountInfoView,
                    payload: AccountInfo.None,
                });
            }}
        >
            <div className="d-flex">
                <div className="align-self-center contact-entry-avatar">
                    <Avatar accountAddress={props.contact.address} />
                </div>
            </div>
            <div className="w-100 text-start contact-entry-center">
                <div className="row">
                    <div className="col-12">
                        {Lib.getAccountDisplayName(
                            props.contact.address,
                            state.ensNames,
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 text-muted teaser">{teaser}</div>
                </div>
            </div>
            <div className="">
                {unreadMessages > 0 && (
                    <span className="badge bg-secondary push-end messages-badge">
                        {unreadMessages}
                    </span>
                )}
            </div>
        </div>
    );
}

export default ContactListEntry;
