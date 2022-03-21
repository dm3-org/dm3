import React from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import { showSignIn } from './sign-in/SignIn';

import Start from './Start';
import Chat, { EnvelopContainer } from './chat/Chat';
import SignInHelp from './sign-in/SignInHelp';

interface RightViewProps {
    connection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.Connection>;
    ensNames: Map<string, string>;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    changeConnection: (newConnection: Partial<Lib.Connection>) => void;
    existingAccount: boolean;
}

function RightView(props: RightViewProps) {
    return (
        <div className="col-md-8 content-container h-100">
            {props.connection.connectionState ===
                Lib.ConnectionState.NoProvider && (
                <div className="col-md-12 text-center row-space">
                    No Ethereum provider detected. Please install a plugin like
                    MetaMask.
                </div>
            )}

            {(!props.selectedContact ||
                props.connection.connectionState ===
                    Lib.ConnectionState.KeyCreation) && (
                <div className="start-chat">
                    {props.connection.provider &&
                        showSignIn(props.connection.connectionState) && (
                            <div className="col-md-12 text-center">
                                <SignInHelp
                                    existingAccount={props.existingAccount}
                                />
                            </div>
                        )}
                    {props.connection.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <Start
                            contacts={props.contacts}
                            connection={props.connection as Lib.Connection}
                            changeConnection={props.changeConnection}
                        />
                    )}
                </div>
            )}

            {props.connection.connectionState ===
                Lib.ConnectionState.SignedIn &&
                props.selectedContact && (
                    <Chat
                        hasContacts={
                            props.contacts !== undefined &&
                            props.contacts.length > 0
                        }
                        contact={props.selectedContact}
                        ensNames={props.ensNames}
                        connection={props.connection as Lib.Connection}
                    />
                )}
        </div>
    );
}

export default RightView;
