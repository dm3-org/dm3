import './Notification.css';
import { useOtp } from './hooks/useOtp';
import { VerificationMethod } from './hooks/VerificationContent';

interface IOtpVerification {
    verificationData: string;
    content: string;
    type: VerificationMethod;
    resendOtp: Function;
    setVerification: Function;
    closeModal: Function;
}

export function OtpVerification(props: IOtpVerification) {
    const {
        showError,
        setShowError,
        errorMsg,
        setErrorMsg,
        isCodeResent,
        setIsCodeResent,
        sendOtp,
    } = useOtp(props.verificationData, props.setVerification, props.closeModal);

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
                                sendOtp(
                                    props.type,
                                    props.verificationData,
                                    setErrorMsg,
                                    setShowError,
                                    setIsCodeResent,
                                );
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
