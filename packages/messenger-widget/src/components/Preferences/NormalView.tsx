import './Preferences.css';
import { preferencesItems } from './bl';
import infoIcon from './../../assets/images/preferences-info.svg';
import backIcon from './../../assets/images/back.svg';
import { useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { closeConfigurationModal } from '../ConfigureProfile/bl';
import { ModalContext } from '../../context/ModalContext';

export function NormalView() {
    const {
        setShowPreferencesModal,
        showProfileConfigurationModal,
        setShowProfileConfigurationModal,
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
                    <div className="row m-0 h-100 w-100">
                        <div className="col-2 m-0 p-0 preferences-aside-content border-radius-6">
                            <div
                                className={
                                    'pt-3 d-flex align-items-center justify-content-center'
                                }
                            >
                                {optionChoosen && (
                                    <img
                                        className="back-icon pointer-cursor"
                                        src={backIcon}
                                        alt="back"
                                        onClick={() => {
                                            setOptionChoosen(null);
                                            closeConfigurationModal(
                                                setShowProfileConfigurationModal,
                                            );
                                        }}
                                    />
                                )}
                                <span
                                    className={'preferences-heading d-flex justify-content-center mb-0'.concat(
                                        ' ',
                                        optionChoosen
                                            ? 'preferences-text-highlighted'
                                            : 'text-primary-color',
                                    )}
                                >
                                    Preferences
                                </span>
                            </div>

                            <hr className="preferences-separator" />
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
                                            {item.name}
                                        </div>
                                    )
                                );
                            })}

                            <div className="d-flex text-primary-color preferences-info">
                                <span className="d-flex pointer-cursor preferences-item">
                                    <img
                                        src={infoIcon}
                                        alt="info"
                                        className="me-2 pref-icon"
                                    />
                                    Information
                                </span>
                            </div>
                        </div>
                        <div className="col-10 m-0 p-0">
                            {optionChoosen && optionChoosen.isEnabled ? (
                                optionChoosen.component
                            ) : (
                                <div className="d-flex align-items-start justify-content-end">
                                    <img
                                        className="close-modal-icon m-2"
                                        src={closeIcon}
                                        alt="close"
                                        onClick={() => {
                                            setShowPreferencesModal(false);
                                            closeConfigurationModal(
                                                setShowProfileConfigurationModal,
                                            );
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
