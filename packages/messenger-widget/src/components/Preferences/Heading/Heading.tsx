import './../Preferences.css';
import { useContext } from 'react';
import closeIcon from '../../../assets/images/cross.svg';
import { ModalContext } from '../../../context/ModalContext';
import { closeConfigurationModal } from '../../ConfigureProfile/bl';

export interface IHeading {
    heading: string;
    description: string;
}

export function Heading(props: IHeading) {
    const { setShowPreferencesModal, setShowProfileConfigurationModal } =
        useContext(ModalContext);

    return (
        <div className="background-container d-flex justify-content-between">
            <div className="preferences-content">
                <h4 className="mb-0 font-weight-800 preferences-topic">
                    {props.heading}
                </h4>
                <span className="font-weight-500 font-size-12">
                    {props.description}
                </span>
            </div>
            <img
                className="close-modal-icon m-2"
                src={closeIcon}
                alt="close"
                onClick={() => {
                    setShowPreferencesModal(false);
                    closeConfigurationModal(setShowProfileConfigurationModal);
                }}
            />
        </div>
    );
}
