import { useEffect, useState } from 'react';
import { VerificationMethod } from './VerificationContent';
import { log } from '@dm3-org/dm3-lib-shared';

export const useOtp = (
    verificationData: string,
    setVerification: Function,
    closeModal: Function,
) => {
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inputs, setInputs] = useState<HTMLElement | null>(null);
    const [isCodeResent, setIsCodeResent] = useState<boolean>(false);

    const otpContent = (type: VerificationMethod) => {
        const email =
            'Please enter the verification code, you received by email.';
        const mobile =
            'Please enter the verification code, you received by SMS.';

        if (type === VerificationMethod.Email) {
            return email;
        } else if (type === VerificationMethod.Telephone) {
            return mobile;
        }

        return email;
    };

    const validateOtp = (
        otp: string,
        verificationData: string,
        setErrorMsg: Function,
        setShowError: Function,
        setVerification: Function,
        closeModal: Function,
    ) => {
        try {
            if (otp === '12345') {
                setErrorMsg('');
                setShowError(false);
                setVerification(verificationData);
                closeModal(undefined);
            } else {
                setErrorMsg('Invalid OTP');
                setShowError(true);
            }
        } catch (error) {
            log(error, 'OTP validation error');
            setErrorMsg('Invalid OTP');
            setShowError(true);
        }
    };

    const sendOtp = async (
        type: VerificationMethod,
        inputData: string,
        setErrorMsg: Function,
        setShowError: Function,
        setOtpSent: Function,
    ): Promise<boolean> => {
        try {
            if (type === VerificationMethod.Email) {
                // send otp
                setShowError(false);
                setOtpSent(true);
                return true;
            } else if (type === VerificationMethod.Telephone) {
                // send otp
                setShowError(false);
                setOtpSent(true);
                return true;
            }
            return false;
        } catch (error) {
            log(error, 'Failed to send otp ');
            setErrorMsg('Failed to send OTP, please try again');
            setShowError(true);
            setOtpSent(false);
            return false;
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
                        verificationData,
                        setErrorMsg,
                        setShowError,
                        setVerification,
                        closeModal,
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

    return {
        showError,
        setShowError,
        errorMsg,
        setErrorMsg,
        inputs,
        setInputs,
        isCodeResent,
        setIsCodeResent,
        sendOtp,
        otpContent,
        validateOtp,
    };
};
