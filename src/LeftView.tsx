import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import Contacts from './contacts/Contacts';
import SignIn from './sign-in/SignIn';
import { isWidgetOpened, toggleWidget } from 'react-chat-widget';
import StorageView from './storage/StorageView';
import { showSignIn } from './sign-in/Phases';
import { GlobalContext } from './GlobalContextProvider';
import { AccountsType } from './reducers/Accounts';

interface LeftViewProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const selectContact = (contact: Lib.Account) => {
        if (!isWidgetOpened()) {
            toggleWidget();
        }

        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: contact,
        });
    };

    return (
        <div className="col-md-4 d-flex align-items-end flex-column ">
            {state.connection.connectionState ===
                Lib.ConnectionState.SignedIn && (
                <Contacts getContacts={props.getContacts} />
            )}
            {showSignIn(state.connection.connectionState) && <SignIn />}
            {state.connection.connectionState ===
                Lib.ConnectionState.SignedIn && (
                <StorageView connection={state.connection} />
            )}
        </div>
    );
}

export default LeftView;
