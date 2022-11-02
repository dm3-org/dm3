import React, { useContext, useEffect, useState } from 'react';
import ContactList from './ContactList';
import AddContactForm from './AddContactForm';
import * as Lib from 'dm3-lib';
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
        <div className="w-100 flex-grow-1 contacts overflow-overlay">
            <div className="text-center contact-list-container">
                <AddContactForm getContacts={props.getContacts} />
            </div>

            {state.accounts.contacts &&
                state.connection.connectionState ===
                    Lib.web3provider.ConnectionState.SignedIn && (
                    <div className="text-center contact-list-container">
                        <ContactList />
                    </div>
                )}
        </div>
    );
}

export default Contacts;
