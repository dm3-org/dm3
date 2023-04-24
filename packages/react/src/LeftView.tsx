import { useContext } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from './GlobalContextProvider';
import Contacts from './contacts/Contacts';
import ConfigBanner from './domain-config/ConfigBanner';
import LeftHeader from './header/LeftHeader';
import StorageView from './storage/StorageView';
import { Connection, ConnectionState } from './web3provider/Web3Provider';

interface LeftViewProps {
    getContacts: (connection: Connection) => Promise<void>;
}

function LeftView(props: LeftViewProps) {
    const { state } = useContext(GlobalContext);

    return state.uiState.maxLeftView ? (
        <div
            className={`col-md-4 pe-0 ps-0 d-flex align-items-start flex-column left-view`}
        >
            <LeftHeader />
            {state.connection.connectionState === ConnectionState.SignedIn && (
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
