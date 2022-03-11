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
    const [messageCounter, setMessageCounter] = useState<Map<string, number>>(
        new Map<string, number>(),
    );

    useEffect(() => {
        if (props.selectedContact) {
            setMessageCounter(
                new Map(
                    messageCounter.set(
                        Lib.formatAddress(props.selectedContact.address),
                        0,
                    ),
                ),
            );
        }
    }, [props.selectedContact]);

    useEffect(() => {
        if (!props.contacts && props.connection.sessionToken) {
            props.getContacts();
        }
    }, [props.connection.sessionToken]);

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
                                messageCounter={messageCounter}
                            />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Contacts;
