import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import Contacts from './contacts/Contacts';
import StorageView from './storage/StorageView';
import { GlobalContext } from './GlobalContextProvider';

interface LeftViewProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const { state } = useContext(GlobalContext);

    return (
        <div className="col-md-4 d-flex align-items-end flex-column ">
            {state.connection.connectionState ===
                Lib.ConnectionState.SignedIn && (
                <>
                    <Contacts getContacts={props.getContacts} />
                    <StorageView connection={state.connection} />
                </>
            )}
        </div>
    );
}

export default LeftView;
