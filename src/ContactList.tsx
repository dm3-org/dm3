import React, { useEffect, useState } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getAccountDisplayName } from './lib/Web3Provider';
import { Envelop, Message } from './lib/Messaging';
import { ethers } from 'ethers';

interface ContactListProps {
    ensNames: Map<string, string>;
    contacts: string[];
    selectContact: (contactAddress: string) => void;
    newMessages: Envelop[];
}

function ContactList(props: ContactListProps) {
    const contactsList = props.contacts.map((contact) => {
        const unreadMessages = props.newMessages.filter(
            (envelop) =>
                ethers.utils.getAddress(
                    (JSON.parse(envelop.message) as Message).from,
                ) === ethers.utils.getAddress(contact),
        ).length;

        return (
            <button
                type="button"
                className="list-group-item list-group-item-action text-start"
                key={contact}
                onClick={() => props.selectContact(contact)}
            >
                {getAccountDisplayName(contact, props.ensNames)}{' '}
                {unreadMessages > 0 && (
                    <span className="badge bg-secondary push-end">
                        {unreadMessages}
                    </span>
                )}
            </button>
        );
    });

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
