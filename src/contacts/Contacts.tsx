import React, { useEffect, useState } from 'react';
import ContactList from './ContactList';
import AddContactForm from './AddContactForm';
import * as Lib from '../lib';

interface ContactsProps {
    apiConnection: Lib.ApiConnection;
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
        if (!props.contacts && props.apiConnection.sessionToken) {
            props.getContacts();
        }
    }, [props.apiConnection.sessionToken]);

    return (
        <>
            <div className="row">
                <div className="col-12 text-center contact-list-container">
                    <AddContactForm
                        apiConnection={props.apiConnection}
                        requestContacts={props.getContacts}
                    />
                </div>
            </div>
            {props.contacts &&
                props.apiConnection.connectionState ===
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
        </>
    );
}

export default Contacts;
