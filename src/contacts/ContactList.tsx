import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../lib';
import ContactListEntry from './ContractListEntry';

interface ContactListProps {
    ensNames: Map<string, string>;
    contacts: Lib.Account[];
    selectContact: (contactAddress: Lib.Account) => void;
    connection: Lib.Connection;
}

function ContactList(props: ContactListProps) {
    const contactsList = props.contacts.map((contact) => (
        <ContactListEntry
            key={contact.address}
            connection={props.connection}
            contact={contact}
            ensNames={props.ensNames}
            selectContact={props.selectContact}
        />
    ));

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
