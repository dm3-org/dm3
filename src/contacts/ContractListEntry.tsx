import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../lib';

interface ContactListProps {
    ensNames: Map<string, string>;
    selectContact: (contactAddress: Lib.Account) => void;
    contact: Lib.Account;
    connection: Lib.Connection;
}

function ContactListEntry(props: ContactListProps) {
    const [unreadMessages, setUnreadMessages] = useState<number>(0);

    useEffect(() => {
        const calcUnreadMessages = () => {
            setUnreadMessages(
                Lib.getConversation(
                    props.contact.address,
                    props.connection,
                ).filter(
                    (container) =>
                        container.messageState === Lib.MessageState.Send,
                ).length,
            );
        };
        calcUnreadMessages();

        props.connection.db.syncNotifications.push(() => {
            calcUnreadMessages();
        });
    }, [props.contact]);

    return (
        <button
            type="button"
            className="list-group-item list-group-item-action text-start"
            key={props.contact.address}
            onClick={() => props.selectContact(props.contact)}
        >
            {Lib.getAccountDisplayName(props.contact.address, props.ensNames)}{' '}
            {unreadMessages > 0 && (
                <span className="badge bg-secondary push-end messages-badge">
                    {unreadMessages}
                </span>
            )}
        </button>
    );
}

export default ContactListEntry;
