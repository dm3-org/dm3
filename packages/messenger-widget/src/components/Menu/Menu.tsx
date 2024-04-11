import './Menu.css';
import { useContext } from 'react';
import addIcon from '../../assets/images/add.svg';
import closeIcon from '../../assets/images/cross.svg';
import aboutIcon from '../../assets/images/about.svg';
import termsIcon from '../../assets/images/terms.svg';
import privacyIcon from '../../assets/images/privacy.svg';
import settingsIcon from '../../assets/images/settings.svg';
import disconnectWallet from '../../assets/images/disconnect-wallet.svg';
import { LeftViewSelected } from '../../utils/enum-type-utils';
import {
    DM3_NETWORK,
    PRIVACY_POLICY,
    TERMS_AND_CONDITIONS,
    openUrlInNewTab,
} from '../../utils/common-utils';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';
import { useDisconnect } from 'wagmi';

export default function Menu() {
    const {
        setShowPreferencesModal,
        setShowAddConversationModal,
        setShowAboutModal,
    } = useContext(ModalContext);
    const { selectedLeftView, setSelectedLeftView } = useContext(UiViewContext);

    const { disconnect } = useDisconnect();

    const showContactList = () => {
        setSelectedLeftView(LeftViewSelected.Contacts);
    };

    return (
        <div id="menu-container" className="h-100">
            <div className="menu-item-cancel d-flex justify-content-end">
                <img
                    src={closeIcon}
                    alt="close"
                    className="pointer-cursor close-icon"
                    onClick={() => showContactList()}
                />
            </div>
            <div
                className="d-flex align-items-center justify-content-start pointer-cursor 
            menu-items font-weight-400 text-primary-color"
                onClick={() => setShowAddConversationModal(true)}
            >
                <img
                    src={addIcon}
                    alt="add"
                    className="pointer-cursor menu-item-icon"
                />
                Add Conversation
            </div>
            <div
                className="d-flex align-items-center justify-content-start pointer-cursor 
            menu-items font-weight-400 text-primary-color"
                onClick={() => {
                    setShowPreferencesModal(true);
                }}
            >
                <img
                    src={settingsIcon}
                    alt="preferences"
                    className="pointer-cursor menu-item-icon"
                />
                Preferences
            </div>

            <hr className="ms-3 me-3 mb-3 line-separator separator text-secondary-color" />

            <div
                className="d-flex align-items-center justify-content-start pointer-cursor 
            menu-items font-weight-400 text-primary-color"
                onClick={() => disconnect()}
            >
                <img
                    src={disconnectWallet}
                    alt="disconnect"
                    className="pointer-cursor menu-item-icon"
                />
                Disconnect Wallet
            </div>

            <hr className="ms-3 me-3 line-separator separator text-secondary-color" />

            <div
                className="d-flex align-items-center font-size-12 mb-1 text-primary-color pointer-cursor"
                onClick={() => setShowAboutModal(true)}
            >
                <img
                    src={aboutIcon}
                    alt="info"
                    className="pointer-cursor menu-item-icon"
                />
                About
            </div>
            <div
                className="d-flex align-items-center font-size-12 mb-1 text-primary-color pointer-cursor"
                onClick={() => openUrlInNewTab(TERMS_AND_CONDITIONS)}
            >
                <img
                    src={termsIcon}
                    alt="terms"
                    className="pointer-cursor menu-item-icon"
                />
                Terms & Conditions
            </div>
            <div
                className="d-flex align-items-center font-size-12 mb-1 text-primary-color pointer-cursor"
                onClick={() => openUrlInNewTab(PRIVACY_POLICY)}
            >
                <img
                    src={privacyIcon}
                    alt="privacy"
                    className="pointer-cursor menu-item-icon"
                />
                Privacy Notice
            </div>

            <div
                className={'width-fill p-3 font-size-14'.concat(
                    ' ',
                    selectedLeftView === LeftViewSelected.Menu
                        ? 'version-container'
                        : '',
                )}
            >
                <hr className="line-separator text-secondary-color" />
                <div className="font-weight-800 text-secondary-color">dm3</div>
                <div className="text-secondary-color">Version 1.1</div>
                <div
                    className="text-secondary-color pointer-cursor"
                    onClick={() => openUrlInNewTab(DM3_NETWORK)}
                >
                    {DM3_NETWORK}
                </div>
            </div>
        </div>
    );
}
