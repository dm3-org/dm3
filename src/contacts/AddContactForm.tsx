import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../lib';

interface AddContactFormProps {
    connection: Lib.Connection;
    getContacts: (connection: Lib.Connection) => Promise<void>;
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
            await Lib.addContact(props.connection, accountToAdd);
            await props.getContacts(props.connection);
            setAccountToAdd('');
        } catch (e) {
            console.log(e);
            setErrorIndication(true);
        }
    };

    return props.connection.connectionState === Lib.ConnectionState.SignedIn ? (
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
