import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../../lib';
import { connectionPhase } from './Phases';
import { ConnectionType } from '../reducers/Connection';
import Icon from '../ui-shared/Icon';

interface GoogleConnectProps {
    storageLocation: Lib.StorageLocation;
    setGoogleAuthState: (authState: GoogleAuthState) => void;
    googleAuthState: GoogleAuthState;
}

const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

export enum GoogleAuthState {
    Ready,
    Pending,
    Success,
    Failed,
}

function GoogleConnect(props: GoogleConnectProps) {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        props.setGoogleAuthState(GoogleAuthState.Ready);
    }, [props.storageLocation]);

    const updateSigninStatus = (isSignedIn: boolean) => {
        try {
            if (
                isSignedIn &&
                props.storageLocation === Lib.StorageLocation.GoogleDrive
            ) {
                props.setGoogleAuthState(GoogleAuthState.Success);
                dispatch({
                    type: ConnectionType.ChangeConnectionState,
                    payload: Lib.ConnectionState.SignInReady,
                });
            } else {
                (window as any).gapi.auth2.getAuthInstance().signIn();
            }
        } catch (e) {
            props.setGoogleAuthState(GoogleAuthState.Failed);
        }
    };

    const initClient = () => {
        (window as any).gapi.client
            .init({
                apiKey: process.env.REACT_APP_GOOGLE_DRIVE_API_KEY,
                clientId: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            })
            .then(
                () => {
                    (window as any).gapi.auth2
                        .getAuthInstance()
                        .isSignedIn.listen(updateSigninStatus);

                    updateSigninStatus(
                        (window as any).gapi.auth2
                            .getAuthInstance()
                            .isSignedIn.get(),
                    );
                },
                (error: any) => {
                    props.setGoogleAuthState(GoogleAuthState.Failed);
                    console.log(error);
                },
            );
    };

    const handleClientLoad = () => {
        props.setGoogleAuthState(GoogleAuthState.Pending);
        (window as any).gapi.load('client:auth2', initClient);
    };

    const getGoogleIconClass = (googleAuthState: GoogleAuthState) => {
        switch (googleAuthState) {
            case GoogleAuthState.Failed:
                return <Icon iconClass="fas fa-exclamation-circle" />;

            case GoogleAuthState.Pending:
                return <Icon iconClass="fas fa-spinner fa-spin" />;

            case GoogleAuthState.Success:
                return <Icon iconClass="fas fa-check-circle" />;

            case GoogleAuthState.Ready:
            default:
                return null;
        }
    };

    return connectionPhase(state.connection.connectionState) ||
        props.storageLocation !== Lib.StorageLocation.GoogleDrive ? null : (
        <div className="row row-space">
            <div className="col-md-5">
                <button
                    onClick={() => handleClientLoad()}
                    type="button"
                    className={`btn btn-${
                        props.googleAuthState === GoogleAuthState.Failed
                            ? 'danger'
                            : 'primary'
                    } btn-lg w-100`}
                    disabled={
                        props.googleAuthState === GoogleAuthState.Success ||
                        props.googleAuthState === GoogleAuthState.Pending
                    }
                >
                    Connect Google Drive
                    <span className="push-end">
                        {getGoogleIconClass(props.googleAuthState)}
                    </span>
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
