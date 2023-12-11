import './ConfigureProfileBox.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { globalConfig } from 'dm3-lib-shared';
import { openConfigurationModal } from '../ConfigureProfile/bl';

export default function ConfigureProfileBox() {
    const { state, dispatch } = useContext(GlobalContext);

    const [showConfigBox, setShowConfigBox] = useState<boolean>(false);

    // handles profile configuration changes
    useEffect(() => {
        setShowConfigBox(
            !state.connection.account?.ensName ||
                state.connection.account?.ensName?.endsWith(
                    globalConfig.ADDR_ENS_SUBDOMAIN(),
                ) ||
                state.cache.accountName.endsWith(
                    globalConfig.ADDR_ENS_SUBDOMAIN(),
                )
                ? true
                : false,
        );
    }, [state.connection.account?.ensName, state.cache.accountName]);

    return showConfigBox ? (
        <div
            data-testid="config-profile-box"
            className={'config-box-main position-absolute width-fill background-container'.concat(
                ' ',
                state.accounts.selectedContact
                    ? 'highlight-right-border'
                    : 'highlight-right-border-none',
            )}
        >
            <div className="box-outer-container border-radius-4 background-config-box background-config-box-border">
                <div className="text-center d-flex justify-content-center configure-msg-box text-primary-color">
                    You have not yet configured your profile.
                </div>
                <div className="d-flex justify-content-center config-btn-container">
                    <button
                        data-testid="config-prof-btn"
                        className="border-radius-6 background-config-box text-primary-color config-box-border"
                        onClick={() => openConfigurationModal(dispatch)}
                    >
                        Configure Profile
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
}
