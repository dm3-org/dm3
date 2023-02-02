import React, { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from 'dm3-lib';
import Contacts from './contacts/Contacts';
import StorageView from './storage/StorageView';
import { GlobalContext } from './GlobalContextProvider';
import LeftHeader from './header/LeftHeader';
import { SelectedRightView } from './reducers/UiState';
import ConfigBanner from './domain-config/ConfigBanner';

interface LeftViewProps {
    getContacts: (connection: Lib.Connection) => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const { state } = useContext(GlobalContext);

    return state.uiState.maxLeftView ? (
        <div
            className={`col-md-${
                state.accounts.selectedContact ||
                state.uiState.selectedRightView === SelectedRightView.UserInfo
                    ? '4'
                    : '12'
            } pe-0 ps-0 d-flex align-items-start flex-column left-view`}
        >
            <LeftHeader />
            {state.connection.connectionState ===
                Lib.web3provider.ConnectionState.SignedIn && (
                <>
                    <Contacts getContacts={props.getContacts} />
                    <ConfigBanner />
                    <StorageView />
                    {/* {state.connection.storageLocation ===
                        Lib.storage.StorageLocation.File && <StorageView />} */}
                </>
            )}
        </div>
    ) : null;
}

export default LeftView;
