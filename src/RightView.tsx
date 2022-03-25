import React, { useContext, useEffect, useState } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from './lib';

import Start from './Start';
import Chat from './chat/Chat';
import { GlobalContext } from './GlobalContextProvider';
import { AccountInfo } from './reducers/shared';
import UserInfo from './user-info/UserInfo';

enum SelectedRightView {
    Error,
    Start,
    Chat,
    UserInfo,
}

function RightView() {
    const { state } = useContext(GlobalContext);

    const [selectedRightView, setSelectedRightView] =
        useState<SelectedRightView>(SelectedRightView.Start);

    useEffect(() => {
        switch (state.connection.connectionState) {
            case Lib.ConnectionState.SignedIn:
                setSelectedRightView(
                    state.accounts.selectedContact
                        ? SelectedRightView.Chat
                        : SelectedRightView.Start,
                );
                break;
            case Lib.ConnectionState.NoProvider:
            default:
                setSelectedRightView(SelectedRightView.Error);
        }
    }, [state.connection.connectionState, state.accounts.selectedContact]);

    useEffect(() => {
        switch (state.accounts.accountInfoView) {
            case AccountInfo.Contact:
            case AccountInfo.Account:
                setSelectedRightView(SelectedRightView.UserInfo);
                break;
            case AccountInfo.None:
            default:
                setSelectedRightView(
                    state.accounts.selectedContact
                        ? SelectedRightView.Chat
                        : SelectedRightView.Start,
                );
        }
    }, [state.accounts.accountInfoView]);

    switch (selectedRightView) {
        case SelectedRightView.Start:
            return (
                <div className="col-md-8 content-container h-100">
                    <div className="start-chat">
                        <Start />
                    </div>
                </div>
            );

        case SelectedRightView.Chat:
            return (
                <div className="col-md-8 content-container h-100">
                    <Chat
                        contact={state.accounts.selectedContact!}
                        connection={state.connection}
                    />
                </div>
            );

        case SelectedRightView.UserInfo:
            return (
                <div className="col-md-8 content-container h-100">
                    <UserInfo
                        account={
                            state.accounts.accountInfoView ===
                            AccountInfo.Account
                                ? state.connection.account!
                                : state.accounts.selectedContact!
                        }
                    />
                </div>
            );

        case SelectedRightView.Error:
        default:
            return (
                <div className="col-md-8 content-container h-100">
                    <div className="col-md-12 text-center row-space">
                        No Ethereum provider detected. Please install a plugin
                        like MetaMask.
                    </div>
                </div>
            );
    }
}

export default RightView;
