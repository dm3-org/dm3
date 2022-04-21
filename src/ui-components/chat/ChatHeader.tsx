import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import Avatar from '../ui-shared/Avatar';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';
import { SelectedRightView } from '../reducers/UiState';

interface ChatHeaderProps {
    account: Lib.Account | undefined;
}

function ChatHeader(props: ChatHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);

    if (state.accounts.accountInfoView !== AccountInfo.None) {
        return (
            <div className="account-name w-100   text-center">Account Info</div>
        );
    } else if (state.uiState.selectedRightView === SelectedRightView.MainFeed) {
        return (
            <div className="account-name w-100   text-center">Main Feed</div>
        );
    } else if (props.account) {
        return (
            <div className="account-name w-100 d-flex justify-content-between account-header h-100 d-flex flex-column">
                <div
                    className="w-100 mt-2"
                    onClick={() =>
                        dispatch({
                            type: AccountsType.SetAccountInfoView,
                            payload: AccountInfo.Contact,
                        })
                    }
                >
                    <div className="row w-100">
                        <div className="col-12 d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="d-flex contact-entry-avatar">
                                    <Avatar
                                        accountAddress={props.account.address}
                                    />
                                </div>
                            </div>
                            <div>
                                {Lib.getAccountDisplayName(
                                    props.account.address,
                                    state.ensNames,
                                )}
                            </div>
                            {props.account.publicKeys?.publicMessagingKey ? (
                                <div className="push-end header-lock text-success">
                                    <Icon iconClass="fas fa-user-check align-bottom" />
                                </div>
                            ) : (
                                <div
                                    className=" push-end header-lock header-lock text-warning"
                                    title="Waiting for user to register public keys"
                                >
                                    <Icon iconClass="fas fa-user-clock align-bottom" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-auto w-100">
                    <div className="row header-buttons">
                        <div className="col-6 d-flex">
                            <button
                                type="button"
                                className="btn btn-secondary w-100 "
                            >
                                Messages
                            </button>
                        </div>
                        <div className="col-6 d-flex">
                            <button
                                type="button"
                                className={`btn btn-outline-secondary w-100 show-add-btn`}
                            >
                                Public User Feed
                            </button>
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
