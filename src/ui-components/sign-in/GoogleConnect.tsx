import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../../lib';
import { connectionPhase } from './Phases';
import { ConnectionType } from '../reducers/Connection';

interface GoogleConnectProps {
    storageLocation: Lib.StorageLocation;
}

const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

function GoogleConnect(props: GoogleConnectProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const handleAuthClick = (event?: any) => {
        (window as any).gapi.auth2.getAuthInstance().signIn();
    };

    const updateSigninStatus = (isSignedIn: boolean) => {
        if (isSignedIn) {
            if (props.storageLocation === Lib.StorageLocation.GoogleDrive) {
                dispatch({
                    type: ConnectionType.ChangeConnectionState,
                    payload: Lib.ConnectionState.SignInReady,
                });
            }
        } else {
            handleAuthClick();
        }
    };

    const initClient = () => {
        console.log(process.env.REACT_APP_GOOGLE_DRIVE_API_KEY);

        (window as any).gapi.client
            .init({
                apiKey: process.env.REACT_APP_GOOGLE_DRIVE_API_KEY,
                clientId: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            })
            .then(
                function () {
                    // Listen for sign-in state changes.
                    (window as any).gapi.auth2
                        .getAuthInstance()
                        .isSignedIn.listen(updateSigninStatus);

                    // Handle the initial sign-in state.
                    updateSigninStatus(
                        (window as any).gapi.auth2
                            .getAuthInstance()
                            .isSignedIn.get(),
                    );
                },
                function (error: any) {
                    console.log(error);
                },
            );
    };

    const handleClientLoad = () => {
        (window as any).gapi.load('client:auth2', initClient);
    };
    if (
        connectionPhase(state.connection.connectionState) ||
        props.storageLocation !== Lib.StorageLocation.GoogleDrive
    ) {
        return null;
    }

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <button
                    onClick={() => handleClientLoad()}
                    type="button"
                    className={`btn btn-primary btn-lg w-100`}
                >
                    Connect Google Drive
                </button>
            </div>
            <div className="col-md-7 help-text">
                Connect to Google Drive
                <p className="explanation"></p>
            </div>
        </div>
    );
}

export default GoogleConnect;
