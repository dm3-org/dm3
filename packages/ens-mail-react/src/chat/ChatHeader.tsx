import React, { useContext } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from 'ens-mail-lib';
import { GlobalContext } from '../GlobalContextProvider';
import Avatar from '../ui-shared/Avatar';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';
import { SelectedRightView, UiStateType } from '../reducers/UiState';
import './Chat.css';

interface ChatHeaderProps {
    account: Lib.Account | undefined;
}

function ChatHeader(props: ChatHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);

    if (state.accounts.accountInfoView !== AccountInfo.None) {
        return (
            <div
                className={
                    ' ps-3 account-name w-100 d-flex justify-content-between' +
                    ' account-header h-100 d-flex flex-column pe-3'
                }
            >
                <div className="w-100 mt-2 mb-2">
                    <div className="w-100">
                        <div className=" d-flex justify-content-between  pe-0">
                            <div className="push-end d-flex">
                                <button
                                    type="button"
                                    className={
                                        `right-btn btn btn-outline-secondary` +
                                        ` w-100 show-add-btn align-self-center`
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({
                                            type: UiStateType.SetMaxLeftView,
                                            payload: !state.uiState.maxLeftView,
                                        });
                                    }}
                                >
                                    {state.uiState.maxLeftView ? (
                                        <Icon iconClass="fas fa-expand" />
                                    ) : (
                                        <Icon iconClass="far fa-window-maximize fa-rotate-270" />
                                    )}
                                </button>
                            </div>
                            <div className="account-header-text">
                                Account Info
                            </div>
                            <div className="d-flex align-items-center">
                                <button
                                    type="button"
                                    className={
                                        `right-btn btn btn-outline-secondary` +
                                        ` w-100 show-add-btn align-self-center`
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({
                                            type: UiStateType.SetSelectedRightView,
                                            payload: SelectedRightView.Chat,
                                        });
                                        dispatch({
                                            type: AccountsType.SetAccountInfoView,
                                            payload: AccountInfo.None,
                                        });
                                        if (!state.accounts.selectedContact) {
                                            dispatch({
                                                type: UiStateType.SetMaxLeftView,
                                                payload: true,
                                            });
                                        }
                                    }}
                                >
                                    <Icon iconClass="fas fa-times fa-lg" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (props.account) {
        return (
            <div
                className={
                    ' ps-3 account-name w-100 d-flex justify-content-between' +
                    ' account-header h-100 d-flex flex-column pe-3'
                }
            >
                <div className="w-100 mt-2 mb-2">
                    <div className="w-100">
                        <div className=" d-flex justify-content-between  pe-0">
                            <div className="push-end d-flex">
                                <button
                                    type="button"
                                    className={
                                        `right-btn btn btn-outline-secondary w-100` +
                                        ` show-add-btn align-self-center`
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({
                                            type: UiStateType.SetMaxLeftView,
                                            payload: !state.uiState.maxLeftView,
                                        });
                                    }}
                                >
                                    {state.uiState.maxLeftView ? (
                                        <Icon iconClass="fas fa-expand" />
                                    ) : (
                                        <Icon iconClass="far fa-window-maximize fa-rotate-270" />
                                    )}
                                </button>
                            </div>
                            <div
                                className="account-header-text"
                                onClick={() =>
                                    dispatch({
                                        type: AccountsType.SetAccountInfoView,
                                        payload: AccountInfo.Contact,
                                    })
                                }
                            >
                                {Lib.getAccountDisplayName(
                                    props.account.address,
                                    state.cache.ensNames,
                                )}
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="d-flex contact-entry-avatar">
                                    <Avatar
                                        accountAddress={props.account.address}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
}

export default ChatHeader;
