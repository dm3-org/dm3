import React, { useContext, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as Lib from 'dm3-lib';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';
import { UiStateType } from '../reducers/UiState';

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
        const normalizedAccountName =
            Lib.account.normalizeEnsName(accountToAdd);
        try {
            if (
                state.userDb?.hiddenContacts.find(
                    (contact) =>
                        Lib.account.normalizeEnsName(contact) ===
                        normalizedAccountName,
                )
            ) {
                dispatch({
                    type: UserDbType.unhideContact,
                    payload: normalizedAccountName,
                });
            } else {
                await Lib.account.addContact(
                    state.connection,
                    normalizedAccountName,
                    state.userDb as Lib.storage.UserDB,
                    (id: string) =>
                        dispatch({
                            type: UserDbType.createEmptyConversation,
                            payload: id,
                        }),
                );
            }

            setAccountToAdd('');
            dispatch({ type: UiStateType.SetShowAddContact, payload: false });
        } catch (e) {
            Lib.log(e as string);
            setErrorIndication(true);
        }
    };

    if (!state.uiState.showAddContact) {
        return null;
    }

    return state.connection.connectionState ===
        Lib.web3provider.ConnectionState.SignedIn ? (
        <form
            className="form-floating add-contact-form"
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <input
                id="inputEl"
                type="text"
                className={`form-control account-input ${
                    errorIndication ? 'add-contact-error' : ''
                }`}
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
            <label
                htmlFor="inputEl"
                className={`text-start ${
                    errorIndication
                        ? 'add-contact-error-label'
                        : 'add-contact-label'
                }`}
            >
                Address or ENS name
            </label>
            <button
                className={`add-btn w-100 btn btn-primary`}
                type="submit"
                onClick={add}
            >
                Add
            </button>
        </form>
    ) : null;
}

export default AddContactForm;
