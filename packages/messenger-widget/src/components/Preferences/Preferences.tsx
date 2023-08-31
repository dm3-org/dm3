import './Preferences.css';
import closeIcon from '../../assets/images/cross.svg';
import { closePreferencesModal } from './bl';

export function Preferences() {
    return (
        <div>
            <div
                id="preferences-modal"
                className="modal-container display-none position-fixed w-100 h-100"
            >
                <div
                    className="preferences-modal-content border-radius-6 
            background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                Preferences
                            </h4>
                        </div>
                        <img
                            className="preferences-close-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => closePreferencesModal()}
                        />
                    </div>

                    <hr className="line-separator preferences-separator text-secondary-color" />
                </div>
            </div>
        </div>
    );
}
