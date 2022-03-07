import React from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';
import { showSignIn } from './sign-in/SignIn';

import Start from './Start';
import Chat, { EnvelopContainer } from './chat/Chat';
import SignInHelp from './sign-in/SignInHelp';

interface RightViewProps {
    apiConnection: {
        connectionState: Lib.ConnectionState;
    } & Partial<Lib.ApiConnection>;
    ensNames: Map<string, string>;
    contacts?: Lib.Account[];
    selectedContact: Lib.Account | undefined;
    changeApiConnection: (newApiConnection: Partial<Lib.ApiConnection>) => void;
    newMessages: EnvelopContainer[];
    setNewMessages: (messages: EnvelopContainer[]) => void;
}

function RightView(props: RightViewProps) {
    return (
        <div className="col-md-8 content-container h-100">
            {(!props.selectedContact ||
                props.apiConnection.connectionState ===
                    Lib.ConnectionState.KeyCreation) && (
                <div className="start-chat">
                    {props.apiConnection.provider &&
                        showSignIn(props.apiConnection.connectionState) && (
                            <div className="col-md-12 text-center">
                                <SignInHelp />
                            </div>
                        )}
                    {props.apiConnection.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <Start
                            contacts={props.contacts}
                            apiConnection={
                                props.apiConnection as Lib.ApiConnection
                            }
                            changeApiConnection={props.changeApiConnection}
                        />
                    )}
                </div>
            )}

            {props.apiConnection.connectionState ===
                Lib.ConnectionState.SignedIn &&
                props.selectedContact && (
                    <Chat
                        hasContacts={
                            props.contacts !== undefined &&
                            props.contacts.length > 0
                        }
                        contact={props.selectedContact}
                        ensNames={props.ensNames}
                        apiConnection={props.apiConnection as Lib.ApiConnection}
                        newMessages={props.newMessages}
                        setNewMessages={props.setNewMessages}
                    />
                )}
        </div>
    );
}

export default RightView;
