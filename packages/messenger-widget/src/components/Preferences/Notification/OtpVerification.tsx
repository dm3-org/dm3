import './Notification.css';
import { useEffect, useState } from 'react';
import { validateOtp } from './bl';

export interface IOtpVerification {
    verificationData: string;
    content: string;
    type: string;
    resendOtp: Function;
    setVerification: Function;
    closeModal: Function;
}

export function OtpVerification(props: IOtpVerification) {
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inputs, setInputs] = useState<HTMLElement | null>(null);
    const [isCodeResent, setIsCodeResent] = useState<boolean>(false);

    const sendOtp = async () => {
        const result = await props.resendOtp();
        if (result) {
            setShowError(false);
            setErrorMsg('');
            setIsCodeResent(true);
        }
    };

    // handles input field value change
    if (inputs) {
        inputs.addEventListener('input', function (e) {
            const target: any = e.target;
            const val = target.value;

            if (isNaN(val)) {
                target.value = '';
                return;
            }

            if (val != '') {
                const next = target.nextElementSibling;
                if (next) {
                    next.focus();
                    setIsCodeResent(false);
                }
            }

            // checks otp and calls backend to validate
            const otpElements: any = document.getElementsByClassName('otp');
            if (otpElements && otpElements.length) {
                let data = '';
                for (let index = 0; index < otpElements.length; index++) {
                    data = data.concat(otpElements[index].value);
                }
                if (data.length === 5) {
                    validateOtp(
                        data,
                        props.verificationData,
                        setErrorMsg,
                        setShowError,
                        props.setVerification,
                        props.closeModal,
                    );
                }
            }
        });

        // handles clearing of otp
        inputs.addEventListener('keyup', function (e) {
            const target: any = e.target;
            const key = e.key.toLowerCase();

            if (key == 'backspace' || key == 'delete') {
                target.value = '';
                setIsCodeResent(false);
                const prev = target.previousElementSibling;
                if (prev) {
                    prev.focus();
                }
                return;
            }
        });
    }

    // focus on OTP input field
    useEffect(() => {
        const inputs = document.getElementById('inputs');
        setInputs(inputs);
        if (inputs) {
            const inputField: any = inputs.firstElementChild;
            inputField && inputField.focus();
        }
    }, []);

    return (
        <div>
            <div className="pe-3">
                {/* Error msg */}
                <div className="d-flex align-items-center">
                    <label className="font-size-14 font-weight-500 invisible">
                        {props.type}
                    </label>
                    <div
                        className={'notification-error font-weight-400 ms-3'.concat(
                            ' ',
                            showError ? 'show-error' : 'hide-error',
                        )}
                    >
                        {errorMsg}
                    </div>
                    {isCodeResent && (
                        <div className="font-weight-400 ms-3 resent-text">
                            Verification code resent successfully
                        </div>
                    )}
                </div>

                {/* OTP input field */}
                <div className="d-flex align-items-center">
                    <label
                        htmlFor={props.type}
                        className="font-size-14 font-weight-500"
                    >
                        {props.type}
                    </label>
                    <div id="inputs">
                        {/* OTP of length 5 */}
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(
                            (data) => {
                                return (
                                    <input
                                        key={data}
                                        className="otp"
                                        type="text"
                                        minLength={1}
                                        maxLength={1}
                                    />
                                );
                            },
                        )}
                    </div>
                    <p className="d-flex resend-code font-weight-300">
                        Please
                        <span
                            className="d-flex ps-1 pe-1 pointer-cursor text-decoration-underline"
                            onClick={() => {
                                sendOtp();
                            }}
                        >
                            {' '}
                            resend
                        </span>
                        the code.
                    </p>
                </div>

                {/* Description content */}
                <div className="d-flex align-items-center">
                    <label
                        htmlFor={props.type}
                        className="font-size-14 font-weight-500 invisible"
                    >
                        {props.type}
                    </label>
                    <p className="notification-description font-weight-300">
                        {props.content}
                    </p>
                </div>
            </div>
        </div>
    );
}
