import './About.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { useContext } from 'react';
import { ModalContext } from '../../context/ModalContext';
import {
    COMMUNITY,
    GITHUB,
    NPM,
    SPECIFICATION,
    openUrlInNewTab,
} from '../../utils/common-utils';
import packageJson from '../../../package.json';

export default function About() {
    const { setShowAboutModal } = useContext(ModalContext);

    return (
        <div>
            <div
                id="about-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="about-modal-content border-radius-6 
                background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">About: dm3</h4>
                            <div className="font-weight-500 font-size-12">
                                Version: {packageJson.version}
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => setShowAboutModal(false)}
                        />
                    </div>

                    <hr className="mb-1 line-separator separator text-secondary-color" />

                    <div className="pe-3">
                        <p className="about-description">
                            dm3 is the web3 messaging interoperability protocol,
                            focussed on secure encryption, decentralization,
                            privacy, interoperability, and scalablily. Connects
                            communication profiles with any ENS Name, GNO name,
                            etc.
                        </p>

                        <p className="about-description">
                            The dm3 messenger (standalone or embedded) is based
                            on the dm3 protocol.
                        </p>

                        <p className="about-description">
                            The dm3 protocol is open-source. Use and contribute
                            at
                            <span
                                className="highlight-links pointer-cursor"
                                onClick={() => openUrlInNewTab(GITHUB)}
                            >
                                {' '}
                                GitHub
                            </span>
                            , read the
                            <span
                                className="highlight-links pointer-cursor"
                                onClick={() => openUrlInNewTab(SPECIFICATION)}
                            >
                                {' '}
                                Specification
                            </span>
                            , or use the ressources on
                            <span
                                className="highlight-links pointer-cursor"
                                onClick={() => openUrlInNewTab(NPM)}
                            >
                                {' '}
                                NPM
                            </span>
                            .
                        </p>

                        <p className="about-description">
                            Join the dm3
                            <span
                                className="highlight-links pointer-cursor"
                                onClick={() => openUrlInNewTab(COMMUNITY)}
                            >
                                {' '}
                                community{' '}
                            </span>
                            now!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
