/* eslint-disable no-console */
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
import Storage from '../../components/Storage/Storage';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/useMainnetProvider';

function DM3(props: Dm3Props) {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);
    const mainnetProvider = useMainnetProvider();

    const { isLoggedIn, account, deliveryServiceToken } =
        useContext(AuthContext);

    // handle delivery service url of the account
    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');

    // handles changes of state on connection to the account
    useEffect(() => {
        if (props.config.connectionStateChange) {
            props.config.connectionStateChange(isLoggedIn);
        }
    }, [isLoggedIn]);

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

    // handles profile fetching and setting
    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (account === undefined) {
                return;
            }
            const deliveryServiceProfile = await getDeliveryServiceProfile(
                account.profile!.deliveryServices[0],
                mainnetProvider!,
                async (url: string) => (await axios.get(url)).data,
            );
            console.log('set new deliveryService url');
            setdeliveryServiceUrl(deliveryServiceProfile!.url);
        };
        getDeliveryServiceUrl();
    }, [account?.profile]);

    // handles socket connection &  contacts with message fetching
    useEffect(() => {
        console.log('start soccect connect efffect');
        if (isLoggedIn && !state.connection.socket && deliveryServiceUrl) {
            if (!state.userDb) {
                throw Error(
                    `Couldn't handle new messages. User db not created.`,
                );
            }

            console.log('start soccect connect');
            if (!account?.profile) {
                throw Error('Could not get account profile');
            }

            const socket = socketIOClient(
                deliveryServiceUrl.replace('/api', ''),
                {
                    autoConnect: false,
                    transports: ['websocket'],
                },
            );

            socket.auth = {
                account: account,
                token: deliveryServiceToken!,
            };
            socket.connect();
            socket.on('message', (envelop: EncryptionEnvelop) => {
                handleNewMessage(account, envelop, state, dispatch);
            });
            socket.on('joined', () => {
                getContacts(
                    mainnetProvider,
                    account,
                    deliveryServiceToken!,
                    state,
                    dispatch,
                    props.config,
                );
            });
            dispatch({ type: ConnectionType.ChangeSocket, payload: socket });
        }
    }, [isLoggedIn, state.connection.socket, deliveryServiceUrl]);

    // handles if any new message received
    useEffect(() => {
        if (state.accounts.selectedContact && state.connection.socket) {
            state.connection.socket.removeAllListeners();

            state.connection.socket.on(
                'message',
                (envelop: EncryptionEnvelop) => {
                    handleNewMessage(account!, envelop, state, dispatch);
                },
            );

            state.connection.socket.on('joined', () => {
                getContacts(
                    mainnetProvider,
                    account!,
                    deliveryServiceToken!,
                    state,
                    dispatch,
                    props.config,
                );
            });
        }
    }, [state.connection.socket, state.userDb?.conversations]);

    // updates rainbow kit provider height to 100% when rendered
    useEffect(() => {
        const childElement = document.getElementById('data-rk-child');
        if (childElement && childElement.parentElement) {
            childElement.parentElement.classList.add('h-100');
        }
    }, []);

    return (
        <div id="data-rk-child" className="border-radius-8 h-100">
            <Storage />
            {!isLoggedIn ? (
                <SignIn
                    hideStorageSelection={props.config.hideStorageSelection}
                    defaultStorageLocation={props.config.defaultStorageLocation}
                    miniSignIn={props.config.miniSignIn}
                />
            ) : (
                <div className="h-100 rounded background-container">
                    <Dashboard getContacts={getContacts} dm3Props={props} />
                </div>
            )}
        </div>
    );
}

export default DM3;
