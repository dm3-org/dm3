import { changeButtonStyle } from '../../utils/style-utils';
import loader from '../../assets/images/loader.svg';
import './ErrorModal.css';
import '../../styles/modal.css';

export default function ErrorModal() {
    return (
        <div>
            <div
                id="error-modal"
                className="modal-container display-none position-fixed w-100 h-100 pointer-cursor"
            >
                <div className="error-modal-content border-radius-6 background-container text-primary-color">
                    <div className="d-flex align-items-center justify-content-evenly">
                        <p id="error-message" className="text-center"></p>
                    </div>
                    <div
                        id="error-modal-spinner"
                        className="justify-content-center pt-3 error-modal-spinner"
                    >
                        <img className="rotating" src={loader} alt="loader" />
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                        <button
                            id="ok-btn"
                            className="border-radius-6 display-none normal-btn-border normal-btn text-primary-color"
                            onMouseOver={(e: React.MouseEvent) =>
                                changeButtonStyle(
                                    e,
                                    'normal-btn',
                                    'normal-btn-hover',
                                )
                            }
                            onMouseOut={(e: React.MouseEvent) =>
                                changeButtonStyle(
                                    e,
                                    'normal-btn-hover',
                                    'normal-btn',
                                )
                            }
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
