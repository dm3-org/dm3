import React, { useContext, useEffect } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from '../lib';

import Chat from './chat/Chat';
import Feed from './feed/Feed';
import { GlobalContext } from './GlobalContextProvider';
import { AccountInfo } from './reducers/shared';
import { SelectedRightView, UiStateType } from './reducers/UiState';
import UserInfo from './user-info/UserInfo';

function RightView() {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        switch (state.connection.connectionState) {
            case Lib.ConnectionState.SignedIn:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: state.accounts.selectedContact
                        ? SelectedRightView.Chat
                        : SelectedRightView.MainFeed,
                });

                break;
            case Lib.ConnectionState.NoProvider:
            default:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: SelectedRightView.Error,
                });
        }
    }, [state.connection.connectionState, state.accounts.selectedContact]);

    useEffect(() => {
        switch (state.accounts.accountInfoView) {
            case AccountInfo.Contact:
            case AccountInfo.Account:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: SelectedRightView.UserInfo,
                });
                break;
            case AccountInfo.None:
            default:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: state.accounts.selectedContact
                        ? SelectedRightView.Chat
                        : SelectedRightView.MainFeed,
                });
        }
    }, [state.accounts.accountInfoView]);

    switch (state.uiState.selectedRightView) {
        case SelectedRightView.MainFeed:
            return (
                <div className="col-md-8 content-container h-100">
                    {state.connection.connectionState ===
                        Lib.ConnectionState.SignedIn && (
                        <Feed
                            accounts={[
                                state.connection.account!,
                                ...(state.accounts.contacts
                                    ? state.accounts.contacts
                                    : []),
                            ]}
                        />
                    )}
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
        case SelectedRightView.UserPublicFeed:
            return (
                <div className="col-md-8 content-container h-100">
                    {state.accounts.selectedContact && (
                        <Feed accounts={[state.accounts.selectedContact]} />
                    )}
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
