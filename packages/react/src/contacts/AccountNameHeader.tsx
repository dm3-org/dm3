import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import { AccountsType } from '../reducers/Accounts';
import { UiStateType } from '../reducers/UiState';
import { AccountInfo } from '../reducers/shared';
import Avatar from '../ui-shared/Avatar';
import Icon from '../ui-shared/Icon';
import useTooltip from '../ui-shared/useTooltip';
import './AccountNameHeader.css';
import { Account, getAccountDisplayName } from 'dm3-lib-profile';

interface AccountNameHeaderProps {
    account: Account;
}

function AccountNameHeader(props: AccountNameHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const tooltipRef = useTooltip(
        props.account.ensName,
        'bottom',
        20,
        'account-tooltip',
    );

    return (
        <div className="account-name w-100  account-header h-100 d-flex flex-column">
            <div className="w-100 mt-3 mb-3">
                <div className="w-100">
                    <div className="d-flex justify-content-between pe-0">
                        <div className="push-end d-flex">
                            <button
                                type="button"
                                className={`right-btn btn btn${
                                    state.uiState.showAddContact
                                        ? ''
                                        : '-outline'
                                }-secondary w-100 show-add-btn align-self-center`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({
                                        type: UiStateType.SetShowAddContact,
                                        payload: !state.uiState.showAddContact,
                                    });
                                }}
                            >
                                <Icon iconClass="fas fa-plus" />
                            </button>
                        </div>
                        <div className="d-flex">
                            <div
                                className="account-header-text align-self-center"
                                onClick={() => {
                                    dispatch({
                                        type: AccountsType.SetAccountInfoView,
                                        payload: AccountInfo.Account,
                                    });
                                }}
                                ref={tooltipRef}
                            >
                                {getAccountDisplayName(
                                    props.account.ensName,
                                    20,
                                )}
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="d-flex contact-entry-avatar">
                                <Avatar ensName={props.account.ensName} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountNameHeader;
