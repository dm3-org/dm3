import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from 'ens-mail-lib';
import Contacts from './contacts/Contacts';
import StorageView from './storage/StorageView';
import { GlobalContext } from './GlobalContextProvider';
import LeftHeader from './header/LeftHeader';

interface LeftViewProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const { state } = useContext(GlobalContext);

    return state.uiState.maxLeftView ? (
        <div
            className={`col-md-${
                state.accounts.selectedContact ? '4' : '12'
            } pe-0 ps-0 d-flex align-items-start flex-column left-view`}
        >
            <LeftHeader />
            {state.connection.connectionState ===
                Lib.ConnectionState.SignedIn && (
                <>
                    <Contacts getContacts={props.getContacts} />
                    <StorageView />
                </>
            )}
        </div>
    ) : null;
}

export default LeftView;
