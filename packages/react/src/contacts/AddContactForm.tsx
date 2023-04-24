import React, { useContext, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { GlobalContext } from '../GlobalContextProvider';
import { UserDbType } from '../reducers/UserDB';
import { UiStateType } from '../reducers/UiState';
import { AccountsType } from '../reducers/Accounts';
import { ethers } from 'ethers';
import { formatAddress, normalizeEnsName } from 'dm3-lib-profile';
import { log } from 'dm3-lib-shared';
import { Connection, ConnectionState } from '../web3provider/Web3Provider';

interface AddContactFormProps {
    getContacts: (connection: Connection) => Promise<void>;
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
            ethers.utils.isAddress(accountToAdd) &&
            process.env.REACT_APP_ADDR_ENS_SUBDOMAIN
                ? normalizeEnsName(
                      formatAddress(accountToAdd) +
                          process.env.REACT_APP_ADDR_ENS_SUBDOMAIN,
                  )
                : normalizeEnsName(accountToAdd);
        try {
            const hiddenContact = state.userDb?.hiddenContacts.find(
                (contact) =>
                    normalizeEnsName(contact.ensName) === normalizedAccountName,
            );

            if (hiddenContact && state.accounts.contacts) {
                if (!hiddenContact.aka) {
                    dispatch({
                        type: UserDbType.unhideContact,
                        payload: normalizedAccountName,
                    });
                } else {
                    dispatch({
                        type: AccountsType.SetSelectedContact,
                        payload: state.accounts.contacts.find(
                            (contact) =>
                                contact.account.ensName === hiddenContact.aka,
                        ),
                    });
                }
            } else {
                dispatch({
                    type: UserDbType.createEmptyConversation,
                    payload: normalizedAccountName,
                });
            }

            setAccountToAdd('');
            dispatch({ type: UiStateType.SetShowAddContact, payload: false });
        } catch (e) {
            log(e as string);
            setErrorIndication(true);
        }
    };

    if (!state.uiState.showAddContact) {
        return null;
    }

    return state.connection.connectionState === ConnectionState.SignedIn ? (
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
