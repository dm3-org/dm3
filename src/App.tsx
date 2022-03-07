import React, { useEffect, useState } from 'react';
import './App.css';
import 'react-chat-widget/lib/styles.css';
import detectEthereumProvider from '@metamask/detect-provider';
import SignIn, { showSignIn } from './sign-in/SignIn';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AccountNameHeader from './contacts/AccountNameHeader';
import ContactList from './contacts/ContactList';
import AddContactForm from './contacts/AddContactForm';
import { ethers } from 'ethers';
import Chat, { EnvelopContainer } from './chat/Chat';
import { isWidgetOpened, toggleWidget } from 'react-chat-widget';
import socketIOClient from 'socket.io-client';
import ChatHeader from './chat/ChatHeader';
import Start from './chat/Start';
import SignInHelp from './sign-in/SignInHelp';
import * as Lib from './lib';
import { getMessage } from './lib/Messaging';

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
    const requestContacts = async (connection: Lib.ApiConnection) => {
        const retrievedContacts = await Lib.getContacts(
            (apiConnection.account as Lib.Account).address,
            apiConnection.sessionToken as string,
        );

        setContacts(retrievedContacts);

        if (
            selectedContact &&
            !selectedContact?.keys?.publicMessagingKey &&
            retrievedContacts.find(
                (contact) =>
                    Lib.formatAddress(contact.address) ===
                    Lib.formatAddress(selectedContact.address),
            )?.keys
        ) {
            setSelectedContact(
                retrievedContacts.find(
                    (contact) =>
                        Lib.formatAddress(contact.address) ===
                        Lib.formatAddress(selectedContact.address),
                ),
            );
        }

        (
            await Promise.all(
                retrievedContacts.map(async (contact) => ({
                    address: contact.address,
                    ens: await Lib.lookupAddress(
                        connection.provider as ethers.providers.JsonRpcProvider,
                        contact.address,
                    ),
                })),
            )
        )
            .filter((lookup) => lookup.ens !== null)
            .forEach((lookup) =>
                ensNames.set(lookup.address, lookup.ens as string),
            );

        setEnsNames(new Map(ensNames));
    };

    const handleNewMessage = async (
        envelop: Lib.EncryptionEnvelop | Lib.Envelop,
        contact: Lib.Account | undefined,
    ) => {
        Lib.log('New messages');

        const innerEnvelop = (
            (envelop as Lib.EncryptionEnvelop).encryptionVersion
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
            await requestContacts(apiConnection as Lib.ApiConnection);
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

    const selectContact = async (contactAddress: Lib.Account) => {
        if (!isWidgetOpened()) {
            toggleWidget();
        }

        setSelectedContact(contactAddress);
    };

    useEffect(() => {
        if (!apiConnection.provider) {
            createWeb3Provider();
        }
    }, [apiConnection.provider]);

    useEffect(() => {
        if (!contacts && apiConnection.sessionToken) {
            requestContacts(apiConnection as Lib.ApiConnection);
        }
    }, [apiConnection.sessionToken]);

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

                    <div className="row header-row">
                        <div
                            className={
                                `account-name-container col-4 text-center` +
                                ` d-flex justify-content-center align-items-center`
                            }
                        >
                            {apiConnection.account && (
                                <AccountNameHeader
                                    account={apiConnection.account}
                                    ensNames={ensNames}
                                    apiConnection={
                                        apiConnection as Lib.ApiConnection
                                    }
                                    changeApiConnection={changeApiConnection}
                                />
                            )}
                        </div>
                        <div
                            className={
                                `col-8 text-center chat-header account-name-container` +
                                ` d-flex justify-content-center align-items-center`
                            }
                        >
                            {selectedContact &&
                                apiConnection.connectionState ===
                                    Lib.ConnectionState.SignedIn && (
                                    <ChatHeader
                                        account={selectedContact}
                                        ensNames={ensNames}
                                    />
                                )}
                            {apiConnection.connectionState !==
                                Lib.ConnectionState.SignedIn && (
                                <div className="account-name">
                                    {apiConnection.connectionState ===
                                    Lib.ConnectionState.KeyCreation
                                        ? 'Create Public Key'
                                        : 'ENS Mail'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="row body-row">
                        <div className="col-md-4">
                            <div className="row">
                                <div className="col-12 text-center contact-list-container">
                                    <AddContactForm
                                        apiConnection={
                                            apiConnection as Lib.ApiConnection
                                        }
                                        requestContacts={requestContacts}
                                    />
                                </div>
                            </div>
                            {contacts &&
                                apiConnection.connectionState ===
                                    Lib.ConnectionState.SignedIn && (
                                    <div className="row">
                                        <div className="col-12 text-center contact-list-container">
                                            <ContactList
                                                ensNames={ensNames}
                                                contacts={contacts}
                                                selectContact={selectContact}
                                                messageCounter={messageCounter}
                                            />
                                        </div>
                                    </div>
                                )}
                            {showSignIn(apiConnection.connectionState) && (
                                <SignIn
                                    apiConnection={
                                        apiConnection as Lib.ApiConnection
                                    }
                                    changeApiConnection={changeApiConnection}
                                    setEnsNames={setEnsNames}
                                    ensNames={ensNames}
                                />
                            )}
                        </div>
                        <div className="col-md-8 content-container h-100">
                            {(!selectedContact ||
                                apiConnection.connectionState ===
                                    Lib.ConnectionState.KeyCreation) && (
                                <div className="start-chat">
                                    {apiConnection.provider &&
                                        showSignIn(
                                            apiConnection.connectionState,
                                        ) && (
                                            <div className="col-md-12 text-center">
                                                <SignInHelp />
                                            </div>
                                        )}
                                    {apiConnection.connectionState ===
                                        Lib.ConnectionState.SignedIn && (
                                        <Start
                                            contacts={contacts}
                                            apiConnection={
                                                apiConnection as Lib.ApiConnection
                                            }
                                            changeApiConnection={
                                                changeApiConnection
                                            }
                                        />
                                    )}
                                </div>
                            )}

                            {apiConnection.connectionState ===
                                Lib.ConnectionState.SignedIn &&
                                selectedContact && (
                                    <Chat
                                        hasContacts={
                                            contacts !== undefined &&
                                            contacts.length > 0
                                        }
                                        contact={selectedContact}
                                        ensNames={ensNames}
                                        apiConnection={
                                            apiConnection as Lib.ApiConnection
                                        }
                                        newMessages={newMessages}
                                        setNewMessages={setNewMessages}
                                    />
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
