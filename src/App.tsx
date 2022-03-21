import React, { useEffect, useState } from 'react';
import './App.css';
import 'react-chat-widget/lib/styles.css';
import detectEthereumProvider from '@metamask/detect-provider';
import socketIOClient from 'socket.io-client';
import * as Lib from './lib';
import { requestContacts } from './ui-shared/RequestContacts';
import Header from './header/Header';
import LeftView from './LeftView';
import RightView from './RightView';
import { useBeforeunload } from 'react-beforeunload';

function App() {
    const [existingAccount, setExistingAccount] = useState<boolean>(false);
    const [synced, setSynced] = useState<boolean>(false);
    const [connection, setConnection] = useState<
        {
            connectionState: Lib.ConnectionState;
        } & Partial<Lib.Connection>
    >({
        connectionState: Lib.ConnectionState.CheckingProvider,
    });
    const [ensNames, setEnsNames] = useState<Map<string, string>>(
        new Map<string, string>(),
    );

    const [contacts, setContacts] = useState<Lib.Account[] | undefined>();
    const [selectedContact, setSelectedContact] = useState<
        Lib.Account | undefined
    >();

    if (synced) {
        useBeforeunload();
    } else {
        useBeforeunload(
            () =>
                "The app is out of sync with the database. You'll loose your new messages.",
        );
    }

    const getContacts = (connection: Lib.Connection) =>
        requestContacts(
            connection,
            selectedContact,
            setSelectedContact,
            setContacts,
            ensNames,
            setEnsNames,
        );

    const handleNewMessage = async (
        envelop: Lib.EncryptionEnvelop,
        contact: Lib.Account | undefined,
    ) => {
        Lib.log('New messages');

        const innerEnvelop = Lib.decryptEnvelop(
            connection as Lib.Connection,
            envelop,
        );

        Lib.storeMessages(
            [{ envelop: innerEnvelop, messageState: Lib.MessageState.Send }],
            connection as Lib.Connection,
        );

        const from = Lib.formatAddress(innerEnvelop.message.from);

        if (
            !contacts?.find(
                (contact) => Lib.formatAddress(contact.address) === from,
            )?.publicKeys?.publicMessagingKey
        ) {
            await getContacts(connection as Lib.Connection);
        }
    };

    useEffect(() => {
        if (
            connection.connectionState === Lib.ConnectionState.SignedIn &&
            !connection.socket
        ) {
            const socket = socketIOClient(
                process.env.REACT_APP_BACKEND as string,
                { autoConnect: false },
            );
            socket.auth = {
                account: connection.account,
                token: (connection.db as Lib.UserDB).deliveryServiceToken,
            };
            socket.connect();
            socket.on('message', (envelop: Lib.EncryptionEnvelop) => {
                handleNewMessage(envelop, selectedContact);
            });
            socket.on('joined', () => {
                getContacts(connection as Lib.Connection);
            });
            changeConnection({ socket });
        }
    }, [connection.connectionState, connection.socket]);

    useEffect(() => {
        if (selectedContact && connection.socket) {
            connection.socket.removeListener('message');
            connection.socket.on(
                'message',
                (envelop: Lib.EncryptionEnvelop) => {
                    handleNewMessage(envelop, selectedContact);
                },
            );
            connection.socket.removeListener('joined');
            connection.socket.on('joined', () => {
                getContacts(connection as Lib.Connection);
            });
        }
    }, [selectedContact]);

    const changeConnection = (newConnection: Partial<Lib.Connection>) => {
        Lib.logConnectionChange(newConnection);
        setConnection({ ...connection, ...newConnection });
    };

    const createWeb3Provider = async () => {
        const web3Provider = await Lib.getWeb3Provider(
            await detectEthereumProvider(),
        );

        if (web3Provider.provider) {
            changeConnection({
                provider: web3Provider.provider,
                connectionState: web3Provider.connectionState,
            });
        } else {
            changeConnection({
                connectionState: web3Provider.connectionState,
            });
        }
    };

    useEffect(() => {
        if (!connection.provider) {
            createWeb3Provider();
        }
    }, [connection.provider]);

    return (
        <div className="container">
            <div className="row main-content-row">
                <div className="col-12 h-100">
                    <Header
                        connection={connection}
                        changeConnection={changeConnection}
                        ensNames={ensNames}
                        selectedContact={selectedContact}
                        contacts={contacts}
                    />
                    <div className="row body-row">
                        <LeftView
                            connection={connection}
                            changeConnection={changeConnection}
                            ensNames={ensNames}
                            selectedContact={selectedContact}
                            contacts={contacts}
                            getContacts={getContacts}
                            setEnsNames={setEnsNames}
                            setSelectedContact={setSelectedContact}
                            setSynced={setSynced}
                            existingAccount={existingAccount}
                            setExistingAccount={setExistingAccount}
                        />
                        <RightView
                            connection={connection}
                            changeConnection={changeConnection}
                            ensNames={ensNames}
                            selectedContact={selectedContact}
                            contacts={contacts}
                            existingAccount={existingAccount}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
