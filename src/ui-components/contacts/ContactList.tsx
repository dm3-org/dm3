import React, { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../../lib';
import ContactListEntry from './ContractListEntry';
import { GlobalContext } from '../GlobalContextProvider';

interface ContactListProps {
    connection: Lib.Connection;
}

function ContactList(props: ContactListProps) {
    const { state } = useContext(GlobalContext);
    const contactsList = state.accounts.contacts
        ? state.accounts.contacts.map((contact) => (
              <ContactListEntry
                  key={contact.address}
                  connection={state.connection}
                  contact={contact}
              />
          ))
        : [];

    return <div className="list-group">{contactsList}</div>;
}

export default ContactList;
