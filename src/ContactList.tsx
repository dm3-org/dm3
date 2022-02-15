import React, { useEffect, useState } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Account, getAccountDisplayName } from './lib/Web3Provider';
import { Envelop, Message } from './lib/Messaging';
import { ethers } from 'ethers';
import { EnvelopContainer } from './Chat';

interface ContactListProps {
    ensNames: Map<string, string>;
    contacts: Account[];
    selectContact: (contactAddress: Account) => void;
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
                {getAccountDisplayName(contact.address, props.ensNames)}{' '}
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
