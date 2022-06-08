import React, { useContext, useEffect, useState } from 'react';
import ContactList from './ContactList';
import AddContactForm from './AddContactForm';
import * as Lib from 'ens-mail-lib';
import './Contacts.css';
import { GlobalContext } from '../GlobalContextProvider';

interface ContactsProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function Contacts(props: ContactsProps) {
    const { state, dispatch } = useContext(GlobalContext);
    useEffect(() => {
        if (
            !state.accounts.contacts &&
            state.userDb?.deliveryServiceToken &&
            state.connection.socket
        ) {
            props.getContacts(state.connection);
        }
    }, [state.userDb?.deliveryServiceToken, state.connection.socket]);

    useEffect(() => {
        if (state.userDb?.conversations) {
            props.getContacts(state.connection);
        }
    }, [state.userDb?.conversationsCount]);

    useEffect(() => {
        if (state.userDb?.conversations) {
            props.getContacts(state.connection);
        }
    }, []);

    return (
        <div className="w-100">
            <div className="row">
                <div className="col-12 text-center contact-list-container">
                    <AddContactForm getContacts={props.getContacts} />
                </div>
            </div>
            {state.accounts.contacts &&
                state.connection.connectionState ===
                    Lib.ConnectionState.SignedIn && (
                    <div className="row">
                        <div className="col-12 text-center contact-list-container">
                            <ContactList connection={state.connection} />
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Contacts;
