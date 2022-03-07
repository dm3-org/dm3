import React from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import Contacts from './contacts/Contacts';
import SignIn, { showSignIn } from './sign-in/SignIn';
import { isWidgetOpened, toggleWidget } from 'react-chat-widget';

interface LeftViewProps {
    apiConnection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.ApiConnection>;
    ensNames: Map<string, string>;
    setEnsNames: (ensNames: Map<string, string>) => void;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    setSelectedContact: (contact: Lib.Account | undefined) => void;
    changeApiConnection: (newApiConnection: Partial<Lib.ApiConnection>) => void;
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
        <div className="col-md-4">
            <Contacts
                apiConnection={props.apiConnection as Lib.ApiConnection}
                ensNames={props.ensNames}
                setEnsNames={props.setEnsNames}
                getContacts={props.getContacts}
                contacts={props.contacts}
                selectContact={selectContact}
                selectedContact={props.selectedContact}
            />
            {showSignIn(props.apiConnection.connectionState) && (
                <SignIn
                    apiConnection={props.apiConnection as Lib.ApiConnection}
                    changeApiConnection={props.changeApiConnection}
                    setEnsNames={props.setEnsNames}
                    ensNames={props.ensNames}
                />
            )}
        </div>
    );
}

export default LeftView;
