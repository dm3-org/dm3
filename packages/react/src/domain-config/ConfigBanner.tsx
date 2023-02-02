import 'react-chat-widget/lib/styles.css';
import Icon from '../ui-shared/Icon';
import './Config.css';
import { GlobalContext } from '../GlobalContextProvider';
import { useContext } from 'react';
import { AccountInfo } from '../reducers/shared';
import { AccountsType } from '../reducers/Accounts';

function ConfigBanner() {
    const { dispatch } = useContext(GlobalContext);
    return (
        <div className="mt-auto w-100 ">
            <div className="config-banner card">
                <div className="card-body">
                    <p className="card-text">
                        You have not yet configured your profile.
                    </p>
                    <div className="d-flex">
                        <button
                            type="button"
                            onClick={() => {
                                dispatch({
                                    type: AccountsType.SetAccountInfoView,
                                    payload: AccountInfo.DomainConfig,
                                });
                            }}
                            className="ms-auto btn btn-primary config-btn "
                        >
                            Configure Profile{' '}
                            <Icon iconClass="fas fa-arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfigBanner;
