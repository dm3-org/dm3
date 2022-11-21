import React, { useEffect, useContext, useState } from 'react';
import './Dm3.css';
import 'react-chat-widget/lib/styles.css';
import socketIOClient from 'socket.io-client';
import * as Lib from 'dm3-lib';
import { requestContacts } from './ui-shared/RequestContacts';
import LeftView from './LeftView';
import RightView from './RightView';
import { useBeforeunload } from 'react-beforeunload';
import { GlobalContext } from './GlobalContextProvider';
import { AccountsType } from './reducers/Accounts';
import { UserDbType } from './reducers/UserDB';
import { ConnectionType } from './reducers/Connection';
import { showSignIn } from './sign-in/Phases';
import SignIn from './sign-in/SignIn';
import { CacheType } from './reducers/Cache';
import { UiStateType } from './reducers/UiState';
import Start from './start/Start';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Config } from './utils/Config';
import Help from './ui-shared/Help';
import axios from 'axios';
import { Contact } from './reducers/shared';

interface dm3Props {
    config: Config;
}

function dm3(props: dm3Props) {
    const { state, dispatch } = useContext(GlobalContext);

    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');

    if (state.userDb?.synced && props.config.warnBeforeLeave) {
        useBeforeunload();
    } else if (props.config.warnBeforeLeave) {
        useBeforeunload(
            () =>
                "The app is out of sync with the database. You'll loose your new messages.",
        );
    }

    useEffect(() => {
        if (props.config.connectionStateChange) {
            props.config.connectionStateChange(
                state.connection.connectionState,
            );
        }
    }, [state.connection.connectionState]);

    useEffect(() => {
        dispatch({
            type: ConnectionType.SetDefaultServiceUrl,
            payload: props.config.defaultServiceUrl,
        });
    }, [props.config.defaultServiceUrl]);

    useEffect(() => {
        dispatch({
            type: UiStateType.SetBrowserStorageBackup,
            payload: props.config.browserStorageBackup,
        });
    }, [props.config.browserStorageBackup]);

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

    useEffect(() => {
        if (state.connection.provider) {
            if (window.ethereum) {
                (window.ethereum as any).on('accountsChanged', () => {
                    window.location.reload();
                });
                (window.ethereum as any).on('chainChanged', () => {
                    window.location.reload();
                });
            }
        }
    }, [state.connection.provider]);

    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (state?.connection?.account?.profile === undefined) {
                return;
            }
            const deliveryServiceProfile =
                await Lib.delivery.getDeliveryServiceProfile(
                    //TODO Implement usage of all delivery services
                    //https://github.com/corpus-ventures/dm3/issues/330
                    state.connection.account.profile.deliveryServices[0],
                    state.connection,
                    async (url) => (await axios.get(url)).data,
                );
            setdeliveryServiceUrl(deliveryServiceProfile!.url);
        };

        getDeliveryServiceUrl();
    }, [state.connection.account?.profile]);

    useEffect(() => {
        if (
            state.connection.connectionState ===
                Lib.web3provider.ConnectionState.SignedIn &&
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
            socket.on('message', (envelop: Lib.messaging.EncryptionEnvelop) => {
                handleNewMessage(envelop);
            });
            socket.on('joined', () => {
                getContacts(state.connection as Lib.Connection);
            });
            dispatch({ type: ConnectionType.ChangeSocket, payload: socket });
        }
    }, [
        state.connection.connectionState,
        state.connection.socket,
        deliveryServiceUrl,
    ]);

    useEffect(() => {
        if (state.accounts.selectedContact && state.connection.socket) {
            state.connection.socket.removeAllListeners();

            state.connection.socket.on(
                'message',
                (envelop: Lib.messaging.EncryptionEnvelop) => {
                    handleNewMessage(envelop);
                },
            );

            state.connection.socket.on('joined', () => {
                getContacts(state.connection as Lib.Connection);
            });
        }
    }, [
        state.accounts.selectedContact,
        state.accounts.selectedContact,
        state.userDb?.conversations,
    ]);

    const getContacts = (connection: Lib.Connection) => {
        if (!state.userDb) {
            throw Error(
                `[getContacts] Couldn't handle new messages. User db not created.`,
            );
        }
        Lib.log('[getContacts]');

        return requestContacts(
            connection,
            state.auth.currentSession?.token!,
            state.accounts.selectedContact,
            (contact: Contact | undefined) =>
                dispatch({
                    type: AccountsType.SetSelectedContact,
                    payload: contact,
                }),
            (contacts: Contact[]) =>
                dispatch({ type: AccountsType.SetContacts, payload: contacts }),
            (address: string, name: string) =>
                dispatch({
                    type: CacheType.AddEnsName,
                    payload: {
                        address,
                        name,
                    },
                }),
            state.userDb,
            (id: string) =>
                dispatch({
                    type: UserDbType.createEmptyConversation,
                    payload: id,
                }),
            (conversations) =>
                conversations.forEach((conversation) =>
                    dispatch({
                        type: UserDbType.addMessage,
                        payload: {
                            container: conversation,
                            connection: connection,
                        },
                    }),
                ),
            props.config.defaultContact,
        );
    };

    const handleNewMessage = async (
        envelop: Lib.messaging.EncryptionEnvelop,
    ) => {
        Lib.log('New messages');

        const innerEnvelop = JSON.parse(
            await Lib.crypto.decryptAsymmetric(
                (state.userDb as Lib.storage.UserDB).keys.encryptionKeyPair,
                JSON.parse(envelop.message),
            ),
        );
        const { incommingTimestamp } = JSON.parse(
            await Lib.crypto.decryptAsymmetric(
                (state.userDb as Lib.storage.UserDB).keys.encryptionKeyPair,
                JSON.parse(envelop.postmark!),
            ),
        );

        if (!state.userDb) {
            throw Error(
                `[handleNewMessage] Couldn't handle new messages. User db not created.`,
            );
        }

        if (!incommingTimestamp) {
            throw Error(`[handleNewMessage] No delivery service timestamp`);
        }

        dispatch({
            type: UserDbType.addMessage,
            payload: {
                container: {
                    envelop: innerEnvelop,
                    messageState: Lib.messaging.MessageState.Send,
                    deliveryServiceIncommingTimestamp: incommingTimestamp,
                },
                connection: state.connection as Lib.Connection,
            },
        });
    };

    const showHelp =
        state.connection.connectionState ===
            Lib.web3provider.ConnectionState.SignedIn &&
        state.accounts.contacts &&
        state.accounts.contacts.length <= 1 &&
        state.uiState.maxLeftView &&
        props.config.showHelp;

    const mainContent = (
        <>
            {showHelp && <Help />}

            <div
                className={`row main-content-row ${showHelp ? '' : 'mt-5'}`}
                style={props.config.style}
            >
                <div className="col-12 h-100">
                    <div className="row h-100">
                        {showSignIn(state.connection.connectionState) ? (
                            <SignIn
                                hideStorageSelection={
                                    props.config.hideStorageSelection
                                }
                                defaultStorageLocation={
                                    props.config.defaultStorageLocation
                                }
                                miniSignIn={props.config.miniSignIn}
                            />
                        ) : (
                            <>
                                <LeftView getContacts={getContacts} />
                                <RightView />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return props.config.inline ? (
        mainContent
    ) : (
        <>
            {(state.uiState.show || props.config.showAlways) && (
                <div
                    className="filler"
                    onClick={() => dispatch({ type: UiStateType.ToggleShow })}
                >
                    <div
                        className="container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {mainContent}
                    </div>
                </div>
            )}
            {!props.config.showAlways && <Start />}
        </>
    );
}

export default dm3;
