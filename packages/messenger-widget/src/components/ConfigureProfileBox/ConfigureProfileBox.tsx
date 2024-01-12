import './ConfigureProfileBox.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { openConfigurationModal } from '../ConfigureProfile/bl';
import { AuthContext } from '../../context/AuthContext';

export default function ConfigureProfileBox() {
    const { state, dispatch } = useContext(GlobalContext);

    const [showConfigBox, setShowConfigBox] = useState<boolean>(false);

    const { account } = useContext(AuthContext);

    // fetches sub domain of ENS
    const isAddrEnsName = account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles profile configuration changes
    useEffect(() => {
        setShowConfigBox(!account?.ensName || isAddrEnsName ? true : false);
    }, [account?.ensName]);

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
            <div
                className="box-outer-container border-radius-4 profile-configuration-box
            profile-configuration-box-border"
            >
                <div className="text-center d-flex justify-content-center configure-msg-box">
                    You have not yet configured your profile.
                </div>
                <div className="d-flex justify-content-center config-btn-container">
                    <button
                        data-testid="config-prof-btn"
                        className="border-radius-6 background-config-box text-primary-color 
                        profile-configuration-box-border"
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
