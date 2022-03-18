import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import AddContactForm from './AddContactForm';
import * as Lib from '../lib';
import './Contacts.css';

interface ContactsProps {
    connection: Lib.Connection;
    ensNames: Map<string, string>;
    setEnsNames: (ensNames: Map<string, string>) => void;
    contacts?: Lib.Account[];
    getContacts: () => Promise<void>;
    selectedContact: Lib.Account | undefined;
    selectContact: (account: Lib.Account) => void;
}

function Contacts(props: ContactsProps) {
    useEffect(() => {
        if (
            !props.contacts &&
            props.connection.sessionToken &&
            props.connection.socket
        ) {
            props.getContacts();
        }
    }, [props.connection.sessionToken, props.connection.socket]);

    return (
        <div className="w-100">
            <div className="row">
                <div className="col-12 text-center contact-list-container">
                    <AddContactForm
                        connection={props.connection}
                        requestContacts={props.getContacts}
                    />
                </div>
            </div>
            {props.contacts &&
                props.connection.connectionState ===
                    Lib.ConnectionState.SignedIn && (
                    <div className="row">
                        <div className="col-12 text-center contact-list-container">
                            <ContactList
                                ensNames={props.ensNames}
                                contacts={props.contacts}
                                selectContact={props.selectContact}
                                connection={props.connection}
                            />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Contacts;
