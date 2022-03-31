import React, { useContext, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';

interface AddContactFormProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function AddContactForm(props: AddContactFormProps) {
    const [accountToAdd, setAccountToAdd] = useState('');
    const [errorIndication, setErrorIndication] = useState<boolean>(false);

    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
        setAccountToAdd((event.target as any).value);
        setErrorIndication(false);
    };
    const { state, dispatch } = useContext(GlobalContext);

    const add = async () => {
        try {
            await Lib.addContact(
                state.connection,
                accountToAdd,
                state.userDb as Lib.UserDB,
                (id: string) =>
                    dispatch({
                        type: UserDbType.createEmptyConversation,
                        payload: id,
                    }),
            );
            await props.getContacts(state.connection);
            setAccountToAdd('');
        } catch (e) {
            Lib.log(e as string);
            setErrorIndication(true);
        }
    };

    return state.connection.connectionState === Lib.ConnectionState.SignedIn ? (
        <form className="input-group" onSubmit={(e) => e.preventDefault()}>
            <input
                type="text"
                className="form-control contact-input "
                placeholder="Address or ENS name"
                aria-label="Address or ENS name"
                value={accountToAdd}
                onInput={onInput}
                style={
                    state.accounts.contacts &&
                    state.accounts.contacts.length > 0
                        ? { borderBottom: 'none' }
                        : {}
                }
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
