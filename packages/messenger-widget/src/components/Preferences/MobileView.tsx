import './Preferences.css';
import { preferencesItems } from './bl';
import { useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import { GlobalContext } from '../../utils/context-utils';
import { ModalStateType } from '../../utils/enum-type-utils';
import { closeConfigurationModal } from '../ConfigureProfile/bl';

export function MobileView() {
    const { state, dispatch } = useContext(GlobalContext);

    const [optionChoosen, setOptionChoosen] = useState<any>(null);

    /**
     *  Opens DM3 profile configuration by default if user clicked
     *  on "Configure Profile" button
     */
    useEffect(() => {
        if (state.modal.isProfileConfigurationPopupActive) {
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
                                    dispatch({
                                        type: ModalStateType.ShowPreferencesModal,
                                        payload: false,
                                    });
                                    closeConfigurationModal(dispatch);
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
