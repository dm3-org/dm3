import './DM3.css';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import { EncryptionEnvelop } from 'dm3-lib-messaging';
import { Dm3Props } from '../../interfaces/config';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { getDeliveryServiceProfile } from 'dm3-lib-profile';
import { getContacts, handleNewMessage, showSignIn } from './bl';
import {
    ConnectionState,
    ConnectionType,
    UiStateType,
} from '../../utils/enum-type-utils';
import { SignIn } from '../SignIn/SignIn';
import Dashboard from '../../views/Dashboard/Dashboard';

function DM3(props: Dm3Props) {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);

    // handle delivery service url of the account
    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');

    // handles changes of state on connection to the account
    useEffect(() => {
        if (props.config.connectionStateChange) {
            props.config.connectionStateChange(
                state.connection.connectionState,
            );
        }
    }, [state.connection.connectionState]);

    // handles default delivery service url changes
    useEffect(() => {
        dispatch({
            type: ConnectionType.SetDefaultServiceUrl,
            payload: props.config.defaultServiceUrl,
        });
    }, [props.config.defaultServiceUrl]);

    // does something of storage which needs to be checked
    useEffect(() => {
        dispatch({
            type: UiStateType.SetBrowserStorageBackup,
            payload: props.config.browserStorageBackup,
        });
    }, [props.config.browserStorageBackup]);

    // handles contact selected by the user from the list
    useEffect(() => {
        if (
            props.config.showContacts === false &&
            state.accounts.selectedContact
        ) {
            dispatch({
                type: UiStateType.SetMaxLeftView,
                payload: false,
            });
        }
    }, [state.accounts.selectedContact]);

    // handles profile fetching and setting
    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (state?.connection?.account?.profile === undefined) {
                return;
            }
            const deliveryServiceProfile = await getDeliveryServiceProfile(
                state.connection.account.profile.deliveryServices[0],
                state.connection.provider!,
                async (url: string) => (await axios.get(url)).data,
            );
            setdeliveryServiceUrl(deliveryServiceProfile!.url);
        };
        getDeliveryServiceUrl();
    }, [state.connection.account?.profile]);

    // handles socket connection &  contacts with message fetching
    useEffect(() => {
        if (
            state.connection.connectionState === ConnectionState.SignedIn &&
            !state.connection.socket &&
            deliveryServiceUrl
        ) {
            if (!state.userDb) {
                throw Error(
                    `Couldn't handle new messages. User db not created.`,
                );
            }

            if (!state.connection.account?.profile) {
                throw Error('Could not get account profile');
            }

            const socket = socketIOClient(deliveryServiceUrl, {
                autoConnect: false,
            });

            socket.auth = {
                account: state.connection.account,
                token: state.auth.currentSession!.token,
            };
            socket.connect();
            socket.on('message', (envelop: EncryptionEnvelop) => {
                handleNewMessage(envelop, state, dispatch);
            });
            socket.on('joined', () => {
                getContacts(state, dispatch, props);
            });
            dispatch({ type: ConnectionType.ChangeSocket, payload: socket });
        }
    }, [
        state.connection.connectionState,
        state.connection.socket,
        deliveryServiceUrl,
    ]);

    // handles if any new message received
    useEffect(() => {
        if (state.accounts.selectedContact && state.connection.socket) {
            state.connection.socket.removeAllListeners();

            state.connection.socket.on(
                'message',
                (envelop: EncryptionEnvelop) => {
                    handleNewMessage(envelop, state, dispatch);
                },
            );

            state.connection.socket.on('joined', () => {
                getContacts(state, dispatch, props);
            });
        }
    }, [state.connection.socket, state.userDb?.conversations]);

    return (
        <div className="border-radius-8">
            {showSignIn(state.connection.connectionState) ? (
                <SignIn
                    hideStorageSelection={props.config.hideStorageSelection}
                    defaultStorageLocation={props.config.defaultStorageLocation}
                    miniSignIn={props.config.miniSignIn}
                />
            ) : (
                <div className="mt-3 ml-3 h-auto rounded dashboard-container background-container">
                    <Dashboard getContacts={getContacts} dm3Props={props} />
                </div>
            )}
        </div>
    );
}

export default DM3;
