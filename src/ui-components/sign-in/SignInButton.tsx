import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import { ConnectionType } from '../reducers/Connection';
import { UserDbType } from '../reducers/UserDB';
import Icon from '../ui-shared/Icon';

interface SignInButtonProps {
    storageLocation: Lib.StorageLocation;
    existingAccount: boolean;
    token: string | undefined;
    storeApiToken: boolean;
    dataFile: string | undefined;
}

function SignInButton(props: SignInButtonProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const requestSignIn = async () => {
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: Lib.ConnectionState.WaitingForSignIn,
        });

        let data = undefined;

        if (props.storageLocation === Lib.StorageLocation.Web3Storage) {
            data = props.existingAccount
                ? await Lib.web3Load(props.token as string)
                : undefined;
        } else if (props.storageLocation === Lib.StorageLocation.GoogleDrive) {
            data = props.existingAccount
                ? await Lib.googleLoad((window as any).gapi)
                : undefined;
        }

        const singInRequest = await Lib.signIn(state.connection, data);

        if (singInRequest.db) {
            Lib.log(`Setting session token`);

            const account: Lib.Account = {
                address: state.connection.account!.address,
            };

            account.publicKeys = Lib.extractPublicKeys(singInRequest.db.keys);

            if (
                props.token &&
                props.storeApiToken &&
                props.storageLocation === Lib.StorageLocation.Web3Storage
            ) {
                window.localStorage.setItem('StorageToken', props.token);
            }

            window.localStorage.setItem(
                'StorageLocation',
                props.storageLocation,
            );

            dispatch({ type: ConnectionType.ChangeAccount, payload: account });
            dispatch({
                type: ConnectionType.ChangeStorageLocation,
                payload: props.storageLocation,
            });
            dispatch({
                type: ConnectionType.ChangeStorageToken,
                payload: props.token,
            });
            dispatch({ type: UserDbType.setDB, payload: singInRequest.db });
            dispatch({
                type: ConnectionType.ChangeConnectionState,
                payload: singInRequest.connectionState,
            });
        }
        dispatch({
            type: ConnectionType.ChangeConnectionState,
            payload: singInRequest.connectionState,
        });
    };

    const getSignInIconClass = (connectionState: Lib.ConnectionState) => {
        switch (connectionState) {
            case Lib.ConnectionState.SignInFailed:
                return <Icon iconClass="fas fa-exclamation-circle" />;
            case Lib.ConnectionState.SignedIn:
                return <Icon iconClass="fas fa-check-circle" />;
            case Lib.ConnectionState.WaitingForSignIn:
                return <Icon iconClass="fas fa-spinner fa-spin" />;
            default:
                return null;
        }
    };

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <button
                    onClick={requestSignIn}
                    type="button"
                    className={`btn btn-${
                        state.connection.connectionState ===
                        Lib.ConnectionState.SignInFailed
                            ? 'danger'
                            : 'primary'
                    } btn-lg w-100`}
                    disabled={
                        !(
                            state.connection.connectionState ===
                                Lib.ConnectionState.SignInReady ||
                            state.connection.connectionState ===
                                Lib.ConnectionState.SignInFailed
                        )
                    }
                >
                    Sign In
                    <span className="push-end">
                        {getSignInIconClass(state.connection.connectionState)}
                    </span>
                </button>
            </div>
            <div className="col-md-7 help-text"></div>
        </div>
    );
}

export default SignInButton;
