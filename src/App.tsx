import React, { useEffect, useState } from 'react';
import './App.css';
import 'react-chat-widget/lib/styles.css';
import detectEthereumProvider from '@metamask/detect-provider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { EnvelopContainer } from './chat/Chat';
import socketIOClient from 'socket.io-client';
import * as Lib from './lib';
import { getMessage } from './lib/Messaging';
import { requestContacts } from './ui-shared/RequestContacts';
import Header from './header/Header';
import LeftView from './LeftView';
import RightView from './RightView';

function App() {
    const [apiConnection, setApiConnection] = useState<
        { connectionState: Lib.ConnectionState } & Partial<Lib.ApiConnection>
    >({
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

    const getContacts = () =>
        requestContacts(
            apiConnection as Lib.ApiConnection,
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
                ? await Lib.decryptMessage(
                      apiConnection as Lib.ApiConnection,
                      (envelop as Lib.EncryptionEnvelop).data,
                  )
                : envelop
        ) as Lib.Envelop;

        const from = Lib.formatAddress(getMessage(innerEnvelop).from);

        if (
            !contacts?.find(
                (contact) => Lib.formatAddress(contact.address) === from,
            )?.keys?.publicMessagingKey
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
            apiConnection.connectionState === Lib.ConnectionState.SignedIn &&
            !apiConnection.socket
        ) {
            const socket = socketIOClient(
                process.env.REACT_APP_BACKEND as string,
                { autoConnect: false },
            );
            socket.auth = {
                account: apiConnection.account,
                token: apiConnection.sessionToken,
            };
            socket.connect();
            socket.on(
                'message',
                (envelop: Lib.Envelop | Lib.EncryptionEnvelop) => {
                    handleNewMessage(envelop, selectedContact);
                },
            );
            changeApiConnection({ socket });
        }
    }, [apiConnection.connectionState, apiConnection.socket]);

    useEffect(() => {
        if (selectedContact && apiConnection.socket) {
            apiConnection.socket.removeListener('message');
            apiConnection.socket.on(
                'message',
                (envelop: Lib.Envelop | Lib.EncryptionEnvelop) => {
                    handleNewMessage(envelop, selectedContact);
                },
            );
        }
    }, [selectedContact]);

    const changeApiConnection = (
        newApiConnection: Partial<Lib.ApiConnection>,
    ) => {
        if (newApiConnection.connectionState) {
            Lib.log(
                `Changing state from ${
                    Lib.ConnectionState[apiConnection.connectionState]
                } to ${Lib.ConnectionState[newApiConnection.connectionState]}`,
            );
        }

        if (newApiConnection.sessionToken) {
            Lib.log(
                `Retrieved new session token: ${newApiConnection.sessionToken}`,
            );
        }

        if (newApiConnection.account) {
            Lib.log(`Account: ${newApiConnection.account.address}`);
        }

        if (newApiConnection.provider) {
            Lib.log(`Provider set`);
        }

        if (newApiConnection.provider) {
            Lib.log(`Socket set`);
        }

        setApiConnection({ ...apiConnection, ...newApiConnection });
    };

    const createWeb3Provider = async () => {
        const web3Provider = await Lib.getWeb3Provider(
            await detectEthereumProvider(),
        );

        if (web3Provider.provider) {
            changeApiConnection({
                provider: web3Provider.provider,
                connectionState: web3Provider.connectionState,
            });
        } else {
            changeApiConnection({
                connectionState: web3Provider.connectionState,
            });
        }
    };

    useEffect(() => {
        if (!apiConnection.provider) {
            createWeb3Provider();
        }
    }, [apiConnection.provider]);

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
                    {apiConnection.connectionState ===
                        Lib.ConnectionState.NoProvider && (
                        <div className="col-md-12 text-center">
                            No Ethereum provider detected.
                        </div>
                    )}

                    <Header
                        apiConnection={apiConnection}
                        changeApiConnection={changeApiConnection}
                        ensNames={ensNames}
                        selectedContact={selectedContact}
                        contacts={contacts}
                    />
                    <div className="row body-row">
                        <LeftView
                            apiConnection={apiConnection}
                            changeApiConnection={changeApiConnection}
                            ensNames={ensNames}
                            selectedContact={selectedContact}
                            contacts={contacts}
                            getContacts={getContacts}
                            setEnsNames={setEnsNames}
                            setSelectedContact={setSelectedContact}
                        />
                        <RightView
                            apiConnection={apiConnection}
                            changeApiConnection={changeApiConnection}
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
