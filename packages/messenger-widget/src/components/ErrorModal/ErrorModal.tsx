import { changeButtonStyle } from '../../utils/style-utils';
import './ErrorModal.css';

export default function ErrorModal() {
    return (
        <div className="error-modal-outer-container">
            <div
                id="error-modal"
                className="error-modal display-none position-fixed w-100 h-100 pointer-cursor"
            >
                <div className="error-modal-content border-radius-6 background-container text-primary-color">
                    <div className="d-flex align-items-center justify-content-evenly">
                        <p id="error-message" className="text-center"></p>
                    </div>
                    <br />
                    <div className="d-flex justify-content-center">
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
