import './ConfigureProfileBox.css';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { globalConfig } from 'dm3-lib-shared';
import { openConfigurationModal } from '../ConfigureProfile/bl';

export default function ConfigureProfileBox() {
    const { state } = useContext(GlobalContext);

    const [showConfigBox, setShowConfigBox] = useState<boolean>(false);

    // fetches sub domain of ENS
    const isAddrEnsName = state.connection.account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles profile configuration changes
    useEffect(() => {
        setShowConfigBox(
            !state.connection.account?.ensName || isAddrEnsName ? true : false,
        );
    }, [state.connection.account?.ensName]);

    return showConfigBox ? (
        <div
            className={'config-box-main width-fill'.concat(
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
                        className="border-radius-6 background-config-box text-primary-color config-box-border"
                        onClick={() => openConfigurationModal()}
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
