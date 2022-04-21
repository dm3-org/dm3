import React, { useContext } from 'react';
import './AccountNameHeader.css';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import Avatar from '../ui-shared/Avatar';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';
import Icon from '../ui-shared/Icon';
import { SelectedRightView, UiStateType } from '../reducers/UiState';

interface AccountNameHeaderProps {
    account: Lib.Account;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const showMainFeed = () => {
        dispatch({
            type: UiStateType.SetSelectedRightView,
            payload: SelectedRightView.MainFeed,
        });
        dispatch({
            type: AccountsType.SetSelectedContact,
            payload: undefined,
        });

        dispatch({
            type: AccountsType.SetAccountInfoView,
            payload: AccountInfo.None,
        });
    };

    return (
        <div className="account-name w-100  account-header h-100 d-flex flex-column">
            <div
                className="w-100 mt-2"
                onClick={() =>
                    dispatch({
                        type: AccountsType.SetAccountInfoView,
                        payload: AccountInfo.Account,
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

                        <div className="w-100 text-start account-name-text">
                            {Lib.getAccountDisplayName(
                                props.account.address,
                                state.ensNames,
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto w-100">
                <div className="row header-buttons">
                    <div className="col-10 d-flex">
                        <button
                            type="button"
                            onClick={showMainFeed}
                            className={`btn btn${
                                state.uiState.selectedRightView ===
                                SelectedRightView.MainFeed
                                    ? ''
                                    : '-outline'
                            }-secondary w-100 `}
                        >
                            Public Feed
                        </button>
                    </div>
                    <div className="col-2 d-flex">
                        <button
                            type="button"
                            className={`btn btn${
                                state.uiState.showAddContact ? '' : '-outline'
                            }-secondary w-100 show-add-btn`}
                            onClick={() => {
                                dispatch({
                                    type: UiStateType.SetShowAddContact,
                                    payload: !state.uiState.showAddContact,
                                });
                            }}
                        >
                            <Icon iconClass="fas fa-plus" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountNameHeader;
