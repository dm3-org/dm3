import './Menu.css';
import { useContext } from 'react';
import addIcon from '../../assets/images/add.svg';
import closeIcon from '../../assets/images/cross.svg';
import aboutIcon from '../../assets/images/about.svg';
import termsIcon from '../../assets/images/terms.svg';
import privacyIcon from '../../assets/images/privacy.svg';
import settingsIcon from '../../assets/images/settings.svg';
import {
    LeftViewSelected,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { GlobalContext } from '../../utils/context-utils';
import { openConversationModal } from '../AddConversation/bl';
import { openUrlInNewTab } from '../../utils/common-utils';

export default function Menu() {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    const showContactList = () => {
        dispatch({
            type: UiViewStateType.SetSelectedLeftView,
            payload: LeftViewSelected.Contacts,
        });
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
                onClick={() => openConversationModal()}
            >
                <img
                    src={addIcon}
                    alt="close"
                    className="pointer-cursor menu-item-icon"
                />
                Add Conversation
            </div>
            <div
                className="d-flex align-items-center justify-content-start pointer-cursor 
            menu-items font-weight-400 text-primary-color"
                onClick={() => {
                    dispatch({
                        type: ModalStateType.ShowPreferencesModal,
                        payload: true,
                    });
                }}
            >
                <img
                    src={settingsIcon}
                    alt="close"
                    className="pointer-cursor menu-item-icon"
                />
                Preferences
            </div>

            <hr className="ms-3 me-3 line-separator separator text-secondary-color" />

            <div
                className="d-flex align-items-center font-size-12 mb-1 text-primary-color pointer-cursor"
                onClick={() => openUrlInNewTab('')}
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
                onClick={() => openUrlInNewTab('')}
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
                onClick={() => openUrlInNewTab('')}
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
                    state.uiView.selectedLeftView === LeftViewSelected.Menu
                        ? 'version-container'
                        : '',
                )}
            >
                <hr className="line-separator text-secondary-color" />
                <div className="font-weight-800 text-secondary-color">dm3</div>
                <div className="text-secondary-color">Version 1.1</div>
                <div
                    className="text-secondary-color"
                    onClick={() => openUrlInNewTab('https://dm3.network')}
                >
                    https://dm3.network
                </div>
            </div>
        </div>
    );
}
