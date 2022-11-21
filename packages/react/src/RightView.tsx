import React, { useContext, useEffect } from 'react';
import 'react-chat-widget/lib/styles.css';
import * as Lib from 'dm3-lib';

import Chat from './chat/Chat';
import { GlobalContext } from './GlobalContextProvider';
import { AccountInfo } from './reducers/shared';
import { SelectedRightView, UiStateType } from './reducers/UiState';
import UserInfo from './user-info/UserInfo';
import RightHeader from './header/RightHeader';
import DarkLogo from './logos/DarkLogo';

function RightView() {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        switch (state.connection.connectionState) {
            case Lib.web3provider.ConnectionState.SignedIn:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: SelectedRightView.Chat,
                });

                break;
            case Lib.web3provider.ConnectionState.ConnectionRejected:
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
                    payload: SelectedRightView.Chat,
                });
        }
    }, [state.accounts.accountInfoView]);

    if (
        !state.accounts.selectedContact &&
        state.uiState.selectedRightView === SelectedRightView.Chat
    ) {
        return null;
    }

    const classes = `col-md-${
        state.uiState.maxLeftView ? '8' : '12'
    } content-container ${
        state.uiState.maxLeftView ? '' : 'content-container-max'
    } h-100 d-flex flex-column`;

    switch (state.uiState.selectedRightView) {
        case SelectedRightView.Chat:
            return (
                <div className={classes}>
                    <RightHeader />
                    {state.accounts.selectedContact && <Chat />}
                </div>
            );

        case SelectedRightView.UserInfo:
            return (
                <div className={classes}>
                    <RightHeader />
                    <UserInfo
                        account={
                            state.accounts.accountInfoView ===
                            AccountInfo.Account
                                ? state.connection.account!
                                : state.accounts.selectedContact?.account!
                        }
                    />
                </div>
            );

        case SelectedRightView.Error:
        default:
            return (
                <div className={`row`}>
                    <div className="col-md-12 text-center row-space d-flex flex-column">
                        <div className="align-self-center mb-3">
                            <DarkLogo />
                        </div>
                        <strong style={{ color: '#fff' }}>
                            No Ethereum provider detected. Please install a
                            plugin like MetaMask.
                        </strong>
                    </div>
                </div>
            );
    }
}

export default RightView;
