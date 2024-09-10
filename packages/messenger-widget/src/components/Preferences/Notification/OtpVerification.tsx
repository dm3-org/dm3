import './Notification.css';
import { useOtp } from './hooks/useOtp';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

interface IOtpVerification {
    verificationData: string;
    content: string;
    type: NotificationChannelType;
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
        sendOtpToChannel,
        handleOtpPaste,
    } = useOtp(
        props.type,
        props.verificationData,
        props.setVerification,
        props.closeModal,
    );

    return (
        <div>
            <div className="pe-3">
                {/* Error msg */}
                <div className="d-flex align-items-center">
                    <label className="font-size-14 font-weight-500 invisible hide-content">
                        {props.type}
                    </label>
                    {!isCodeResent && (
                        <div
                            className={'notification-error font-weight-400'.concat(
                                ' ',
                                showError ? 'show-error' : 'hide-error',
                            )}
                        >
                            {errorMsg}
                        </div>
                    )}
                    {isCodeResent && (
                        <div className="font-weight-400 ms-3 resent-text">
                            Verification code resent successfully
                        </div>
                    )}
                </div>

                {/* OTP input field */}
                <div className="d-flex add-notification-items">
                    <label
                        htmlFor={props.type}
                        className="font-size-14 font-weight-500"
                    >
                        {props.type}
                    </label>
                    <div id="inputs" onPaste={() => handleOtpPaste()}>
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
                                sendOtpToChannel(
                                    props.type,
                                    props.verificationData,
                                    setErrorMsg,
                                    setShowError,
                                    setIsCodeResent,
                                    true,
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
                        className="font-size-14 font-weight-500 invisible hide-content"
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
