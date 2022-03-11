import React from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import Contacts from './contacts/Contacts';
import SignIn, { showSignIn } from './sign-in/SignIn';
import { isWidgetOpened, toggleWidget } from 'react-chat-widget';
import StorageView from './storage/StorageView';

interface LeftViewProps {
    connection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.Connection>;
    ensNames: Map<string, string>;
    setEnsNames: (ensNames: Map<string, string>) => void;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    setSelectedContact: (contact: Lib.Account | undefined) => void;
    changeConnection: (newConnection: Partial<Lib.Connection>) => void;
    getContacts: () => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const selectContact = (contactAddress: Lib.Account) => {
        if (!isWidgetOpened()) {
            toggleWidget();
        }

        props.setSelectedContact(contactAddress);
    };

    return (
        <div className="col-md-4 d-flex align-items-end flex-column ">
            <Contacts
                connection={props.connection as Lib.Connection}
                ensNames={props.ensNames}
                setEnsNames={props.setEnsNames}
                getContacts={props.getContacts}
                contacts={props.contacts}
                selectContact={selectContact}
                selectedContact={props.selectedContact}
            />
            {showSignIn(props.connection.connectionState) && (
                <SignIn
                    connection={props.connection as Lib.Connection}
                    changeConnection={props.changeConnection}
                    setEnsNames={props.setEnsNames}
                    ensNames={props.ensNames}
                />
            )}
            {props.connection.connectionState ===
                Lib.ConnectionState.SignedIn && (
                <StorageView connection={props.connection as Lib.Connection} />
            )}
        </div>
    );
}

export default LeftView;
