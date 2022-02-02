import React, { useEffect, useState } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getAccountDisplayName } from './lib/Web3Provider';

interface ContactListProps {
    ensNames: Map<string, string>;
    contacts: string[];
}

function ContactList(props: ContactListProps) {
    const contactsList = props.contacts.map((contact) => (
        <button
            type="button"
            className="list-group-item list-group-item-action "
            key={contact}
            onClick={() => {}}
        >
            {getAccountDisplayName(contact, props.ensNames)}
        </button>
    ));

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
