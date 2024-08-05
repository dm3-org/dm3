import './Preferences.css';
import { preferencesItems } from './bl';
import { useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { closeConfigurationModal } from '../ConfigureProfile/bl';
import { ModalContext } from '../../context/ModalContext';

export function MobileView() {
    const {
        setShowPreferencesModal,
        showProfileConfigurationModal,
        setShowProfileConfigurationModal,
        resetConfigureProfileModal
    } = useContext(ModalContext);

    const [optionChoosen, setOptionChoosen] = useState<any>(null);

    /**
     *  Opens DM3 profile configuration by default if user clicked
     *  on "Configure Profile" button
     */
    useEffect(() => {
        if (showProfileConfigurationModal) {
            setOptionChoosen(preferencesItems[1]);
        }
    }, []);

    // reset states of configure profile modal if any other component is loaded
    useEffect(() => {
        if (optionChoosen && optionChoosen.name !== "dm3 Profile") {
            resetConfigureProfileModal();
        }
    }, [optionChoosen]);

    return (
        <div>
            <div
                id="preferences-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="preferences-modal-content border-radius-6 
            background-chat text-primary-color"
                >
                    <div className="m-0 w-100 h-100">
                        <div className="m-0 p-0 preferences-aside-content border-radius-6">
                            <div className="d-flex">
                                {preferencesItems.map((item, index) => {
                                    return (
                                        item.isEnabled && (
                                            <div
                                                className={'target d-flex preferences-item '.concat(
                                                    ' ',
                                                    optionChoosen &&
                                                        optionChoosen.name ===
                                                        item.name
                                                        ? 'normal-btn-hover'
                                                        : '',
                                                )}
                                                key={index}
                                                onClick={() =>
                                                    setOptionChoosen(item)
                                                }
                                            >
                                                {item.icon}
                                            </div>
                                        )
                                    );
                                })}
                            </div>

                            <img
                                className="close-modal-icon m-2"
                                src={closeIcon}
                                alt="close"
                                onClick={() => {
                                    resetConfigureProfileModal();
                                    setShowPreferencesModal(false);
                                    closeConfigurationModal(
                                        setShowProfileConfigurationModal,
                                    );
                                }}
                            />
                        </div>

                        <div className="m-0 p-0 preferences-component">
                            {optionChoosen &&
                                optionChoosen.isEnabled &&
                                optionChoosen.component}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
