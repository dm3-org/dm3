import 'react-chat-widget/lib/styles.css';
import Icon from '../ui-shared/Icon';
import './Config.css';
import { GlobalContext } from '../GlobalContextProvider';
import { useContext } from 'react';
import { AccountInfo } from '../reducers/shared';
import { AccountsType } from '../reducers/Accounts';
import { UserDbType } from '../reducers/UserDB';
import { globalConfig } from 'dm3-lib-shared';
function ConfigBanner() {
    const { state, dispatch } = useContext(GlobalContext);

    const isAddrEnsName = state.connection.account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    return !state.userDb?.configViewed &&
        (!state.connection.account?.ensName || isAddrEnsName) ? (
        <div className="mt-auto w-100 ">
            <div className="config-banner card">
                <div className="card-body">
                    <p className="small card-text text-center">
                        You have not yet configured your profile.
                    </p>
                    <div className="d-flex justify-content-center">
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch({
                                        type: AccountsType.SetAccountInfoView,
                                        payload: AccountInfo.DomainConfig,
                                    });
                                    dispatch({
                                        type: UserDbType.setConfigViewed,
                                        payload: true,
                                    });
                                }}
                                className="ms-auto btn btn-outline-secondary config-btn "
                            >
                                Configure Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default ConfigBanner;
