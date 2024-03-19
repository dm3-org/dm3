import '../../styles/modal.css';
import './ConfigureProfile.css';
import { useContext } from 'react';
import { MobileView } from './MobileView';
import { NormalView } from './NormalView';
import { closeConfigurationModal } from './bl';
import closeIcon from '../../assets/images/cross.svg';
import { GlobalContext } from '../../utils/context-utils';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ConfigureProfileContextProvider } from './context/ConfigureProfileContext';

export function ConfigureDM3Profile() {
    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                <MobileView />
            ) : (
                <NormalView />
            )}
        </>
    );
}

function ConfigureUserProfile() {
    const { dispatch } = useContext(GlobalContext);

    return (
        <div>
            <div
                id="configuration-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="configuration-modal-content border-radius-6 
                    background-chat text-primary-color"
                >
                    {/* Header */}
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                DM3 Profile Configuration
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Your dm3 profile needs to be published. You can
                                use your own ENS name, get a DM3 name, or keep
                                your wallet address.
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => closeConfigurationModal(dispatch)}
                        />
                    </div>

                    <hr className="line-separator separator text-secondary-color" />

                    <ConfigureDM3Profile />
                </div>
            </div>
        </div>
    );
}

export function ConfigureProfile() {
    return (
        <ConfigureProfileContextProvider>
            <ConfigureUserProfile />
        </ConfigureProfileContextProvider>
    );
}
