import './Notification.css';
import './../../../styles/modal.css';
import closeIcon from '../../../assets/images/cross.svg';
import { FormEvent } from 'react';
import { OtpVerification } from './OtpVerification';
import { useVerification } from './hooks/useVerification';
import { VerificationMethod } from './hooks/VerificationContent';
import { useOtp } from './hooks/useOtp';

export interface IVerificationModal {
    heading: string;
    description: string;
    type: VerificationMethod;
    placeholder: string;
    content: string;
    action: Function;
    setVerification: Function;
}

export function VerificationModal(props: IVerificationModal) {
    const BTN_CLASS =
        'verify-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

    const INPUT_FIELD_CLASS =
        'notification-input-field font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

    const {
        inputData,
        setInputData,
        showError,
        setShowError,
        errorMsg,
        setErrorMsg,
        otpSent,
        setOtpSent,
        resendOtp,
        submit,
        handleInputChange,
    } = useVerification(props.action, props.setVerification);

    const { otpContent } = useOtp(
        inputData,
        props.setVerification,
        props.action,
    );

    return (
        <div>
            <div
                id="notification-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="notification-modal-content border-radius-6 
        background-container text-primary-color"
                >
                    {/* Heading & description */}
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                {props.heading}
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                {props.description}
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => {
                                props.action(undefined);
                            }}
                        />
                    </div>

                    <hr className="line-separator notification-separator text-secondary-color" />

                    {!otpSent ? (
                        <form
                            onSubmit={(e: React.FormEvent) => {
                                submit(
                                    e,
                                    props.type,
                                    inputData,
                                    setErrorMsg,
                                    setShowError,
                                    setOtpSent,
                                );
                            }}
                            className="mt-0 mb-2 d-flex"
                        >
                            <div className="pe-3">
                                {/* Error msg */}
                                <div className="d-flex align-items-center">
                                    <label
                                        htmlFor={props.type}
                                        className="font-size-14 font-weight-500 invisible hide-content"
                                    >
                                        {props.type}
                                    </label>
                                    <div
                                        className={'notification-error font-weight-400'.concat(
                                            ' ',
                                            showError
                                                ? 'show-error'
                                                : 'hide-error',
                                        )}
                                    >
                                        {errorMsg}
                                    </div>
                                </div>

                                {/* Input field & verify button */}
                                <div className="d-flex add-notification-items">
                                    <label
                                        htmlFor={props.type}
                                        className="font-size-14 font-weight-500"
                                    >
                                        {props.type}
                                    </label>
                                    <input
                                        className={INPUT_FIELD_CLASS.concat(
                                            ' ',
                                            showError ? 'err-background' : '',
                                        )}
                                        type={
                                            props.type ===
                                            VerificationMethod.Email
                                                ? 'text'
                                                : 'number'
                                        }
                                        placeholder={props.placeholder}
                                        value={inputData}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            handleInputChange(
                                                e,
                                                setInputData,
                                                setErrorMsg,
                                                setShowError,
                                            );
                                        }}
                                    />
                                    <div>
                                        <button
                                            disabled={
                                                !inputData ||
                                                !inputData.length ||
                                                showError
                                            }
                                            className={BTN_CLASS.concat(
                                                ' ',
                                                !inputData ||
                                                    !inputData.length ||
                                                    showError
                                                    ? 'modal-btn-disabled'
                                                    : 'modal-btn-active',
                                            )}
                                            onClick={(e: FormEvent) => {
                                                submit(
                                                    e,
                                                    props.type,
                                                    inputData,
                                                    setErrorMsg,
                                                    setShowError,
                                                    setOtpSent,
                                                );
                                            }}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>

                                {/* Description content */}
                                <div className="d-flex align-items-center">
                                    <label
                                        htmlFor={props.type}
                                        className="font-size-14 font-weight-500 invisible hide-content"
                                    >
                                        {props.type}
                                    </label>
                                    <p className="notification-description font-weight-300">
                                        {props.content}
                                    </p>
                                    <div className="invisible hide-content">
                                        <button
                                            disabled={false}
                                            className={BTN_CLASS}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <OtpVerification
                            verificationData={inputData}
                            setVerification={props.setVerification}
                            type={props.type}
                            content={otpContent(props.type)}
                            resendOtp={resendOtp}
                            closeModal={props.action}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
