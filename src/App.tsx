import React, { useEffect, useState } from 'react';
import './App.css';
import 'react-chat-widget/lib/styles.css';
import detectEthereumProvider from '@metamask/detect-provider';
import { EnvelopContainer } from './chat/Chat';
import socketIOClient from 'socket.io-client';
import * as Lib from './lib';
import { requestContacts } from './ui-shared/RequestContacts';
import Header from './header/Header';
import LeftView from './LeftView';
import RightView from './RightView';
import { useBeforeunload } from 'react-beforeunload';

function App() {
    const [synced, setSynced] = useState<boolean>(false);
    const [connection, setConnection] = useState<
        {
            connectionState: Lib.ConnectionState;
            db: Lib.UserDB;
        } & Partial<Lib.Connection>
    >({
        db: Lib.createDB(setSynced),
        connectionState: Lib.ConnectionState.CheckingProvider,
    });
    const [ensNames, setEnsNames] = useState<Map<string, string>>(
        new Map<string, string>(),
    );
    const [messageCounter, setMessageCounter] = useState<Map<string, number>>(
        new Map<string, number>(),
    );

    const [contacts, setContacts] = useState<Lib.Account[] | undefined>();
    const [selectedContact, setSelectedContact] = useState<
        Lib.Account | undefined
    >();

    const [newMessages, setNewMessages] = useState<EnvelopContainer[]>([]);

    if (synced) {
        useBeforeunload();
    } else {
        useBeforeunload(
            () =>
                "The app is out of sync with the database. You'll loose your new messages.",
        );
    }

    const getContacts = () =>
        requestContacts(
            connection as Lib.Connection,
            selectedContact,
            setSelectedContact,
            setContacts,
            ensNames,
            setEnsNames,
        );

    const handleNewMessage = async (
        envelop: Lib.EncryptionEnvelop | Lib.Envelop,
        contact: Lib.Account | undefined,
    ) => {
        Lib.log('New messages');

        const innerEnvelop = (
            Lib.isEncryptionEnvelop(envelop)
                ? Lib.decryptEnvelop(connection as Lib.Connection, envelop)
                : envelop
        ) as Lib.Envelop;

        Lib.storeMessages([innerEnvelop], connection as Lib.Connection);

        const from = Lib.formatAddress(innerEnvelop.message.from);

        if (
            !contacts?.find(
                (contact) => Lib.formatAddress(contact.address) === from,
            )?.publicKeys?.publicMessagingKey
        ) {
            await getContacts();
        } else if (contact && from === Lib.formatAddress(contact.address)) {
            setNewMessages((oldMessages) =>
                oldMessages.concat({
                    envelop: innerEnvelop,
                    encrypted: (envelop as Lib.EncryptionEnvelop)
                        .encryptionVersion
                        ? true
                        : false,
                }),
            );
        }

        if (!contact || from !== Lib.formatAddress(contact.address)) {
            setMessageCounter(
                new Map(
                    messageCounter.set(
                        from,
                        messageCounter.has(from)
                            ? (messageCounter.get(from) as number) + 1
                            : 1,
                    ),
                ),
            );
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
                token: connection.sessionToken,
            };
            socket.connect();
            socket.on(
                'message',
                (envelop: Lib.Envelop | Lib.EncryptionEnvelop) => {
                    handleNewMessage(envelop, selectedContact);
                },
            );
            changeConnection({ socket });
        }
    }, [connection.connectionState, connection.socket]);

    useEffect(() => {
        if (selectedContact && connection.socket) {
            connection.socket.removeListener('message');
            connection.socket.on(
                'message',
                (envelop: Lib.Envelop | Lib.EncryptionEnvelop) => {
                    handleNewMessage(envelop, selectedContact);
                },
            );
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

    useEffect(() => {
        if (selectedContact) {
            setMessageCounter(
                new Map(
                    messageCounter.set(
                        Lib.formatAddress(selectedContact.address),
                        0,
                    ),
                ),
            );
        }
    }, [selectedContact]);

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
                        />
                        <RightView
                            connection={connection}
                            changeConnection={changeConnection}
                            ensNames={ensNames}
                            selectedContact={selectedContact}
                            contacts={contacts}
                            newMessages={newMessages}
                            setNewMessages={setNewMessages}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
