import React, { useEffect, useState } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { addContact, ApiConnection, ConnectionState } from './lib/Web3Provider';
import { addContact as addContactApi } from './external-apis/BackendAPI';
import { resolveName } from './external-apis/InjectedWeb3API';

interface AddContactFormProps {
    apiConnection: ApiConnection;
    requestContacts: (apiConnection: ApiConnection) => Promise<void>;
}

function AddContactForm(props: AddContactFormProps) {
    const [accountToAdd, setAccountToAdd] = useState('');
    const [errorIndication, setErrorIndication] = useState<boolean>(false);

    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
        setAccountToAdd((event.target as any).value);
        setErrorIndication(false);
    };

    const add = async () => {
        try {
            await addContact(
                props.apiConnection,
                accountToAdd,
                resolveName,
                addContactApi,
            );
            await props.requestContacts(props.apiConnection);
            setAccountToAdd('');
        } catch (e) {
            setErrorIndication(true);
        }
    };

    return props.apiConnection.connectionState === ConnectionState.SignedIn ? (
        <form className="input-group" onSubmit={(e) => e.preventDefault()}>
            <input
                type="text"
                className="form-control contact-input "
                placeholder="Address or ENS name"
                aria-label="Address or ENS name"
                value={accountToAdd}
                onInput={onInput}
            />
            <button
                className={`contact-input-btn btn btn-${
                    errorIndication ? 'danger' : 'secondary '
                }`}
                type="submit"
                onClick={add}
            >
                Add
            </button>
        </form>
    ) : null;
}

export default AddContactForm;
