import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from './lib';

interface ContactListProps {
    ensNames: Map<string, string>;
    contacts: Lib.Account[];
    selectContact: (contactAddress: Lib.Account) => void;
    messageCounter: Map<string, number>;
}

function ContactList(props: ContactListProps) {
    const contactsList = props.contacts.map((contact) => {
        const unreadMessages = props.messageCounter.has(contact.address)
            ? (props.messageCounter.get(contact.address) as number)
            : 0;

        return (
            <button
                type="button"
                className="list-group-item list-group-item-action text-start"
                key={contact.address}
                onClick={() => props.selectContact(contact)}
            >
                {Lib.getAccountDisplayName(contact.address, props.ensNames)}{' '}
                {unreadMessages > 0 && (
                    <span className="badge bg-secondary push-end messages-badge">
                        {unreadMessages}
                    </span>
                )}
            </button>
        );
    });

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
