import { log } from '@dm3-org/dm3-lib-shared';
import { IVerificationModal } from './VerificationModal';

export const BTN_CLASS =
    'verify-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

export const INPUT_FIELD_CLASS =
    'notification-input-field font-weight-400 font-size-14 border-radius-6 w-100 line-height-24';

export enum VerificationMethod {
    Email = 'Email',
    Telephone = 'Telephone',
}

export const getVerficationModalContent = (
    type: VerificationMethod,
    action: Function,
    setVerification: Function,
): IVerificationModal => {
    const emailContent: IVerificationModal = {
        heading: 'Add Email',
        description: 'Add and verify email address for dm3 notifications.',
        type: VerificationMethod.Email,
        placeholder: 'Enter your email address.',
        content:
            'Please enter your email address! To verify the ownership of ' +
            'your email address, you will receive an email containing a verification code.',
        action: action,
        setVerification: setVerification,
    };

    const phoneContent: IVerificationModal = {
        heading: 'Add Telephone',
        description: 'Add and verify telephone number for dm3 notifications.',
        type: VerificationMethod.Telephone,
        placeholder: 'Enter your telephone number.',
        content:
            'Please enter your telephone number! To verify the ownership of your telephone ' +
            'number, you will receive a SMS containing a verification code.',
        action: action,
        setVerification: setVerification,
    };

    switch (type) {
        case VerificationMethod.Email:
            return emailContent;
        case VerificationMethod.Telephone:
            return phoneContent;
        default:
            return emailContent;
    }
};

export const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setInputData: Function,
    setErrorMsg: Function,
    setShowError: Function,
) => {
    setErrorMsg('');
    setShowError(false);
    setInputData(e.target.value);
};

export const submit = async (
    e: React.FormEvent,
    type: VerificationMethod,
    inputData: string,
    setErrorMsg: Function,
    setShowError: Function,
    setOtpSent: Function,
) => {
    e.preventDefault();
    const check = validateInputData(type, inputData, setErrorMsg, setShowError);
    if (check) {
        await sendOtp(type, inputData, setErrorMsg, setShowError, setOtpSent);
    }
};

export const validateInputData = (
    type: VerificationMethod,
    inputData: string,
    setErrorMsg: Function,
    setShowError: Function,
): boolean => {
    /* eslint-disable max-len */
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (type === VerificationMethod.Email) {
        if (!emailRegex.test(inputData)) {
            setErrorMsg('Please enter valid email ID');
            setShowError(true);
            return false;
        }
    } else if (type === VerificationMethod.Telephone) {
        if (!phoneRegex.test(inputData)) {
            setErrorMsg('Please enter valid phone no.');
            setShowError(true);
            return false;
        }
    }

    return true;
};

export const sendOtp = async (
    type: VerificationMethod,
    inputData: string,
    setErrorMsg: Function,
    setShowError: Function,
    setOtpSent: Function,
): Promise<boolean> => {
    try {
        if (type === VerificationMethod.Email) {
            // send otp
            setOtpSent(true);
            return true;
        } else if (type === VerificationMethod.Telephone) {
            // send otp
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

export const validateOtp = (
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

export const otpContent = (type: VerificationMethod) => {
    const email = 'Please enter the verification code, you received by email.';
    const mobile = 'Please enter the verification code, you received by SMS.';

    if (type === VerificationMethod.Email) {
        return email;
    } else if (type === VerificationMethod.Telephone) {
        return mobile;
    }

    return email;
};

export const deleteEmail = async (data: string, setEmail: Function) => {
    try {
        setEmail(null);
    } catch (error) {
        log(error, 'Failed to remove email ID');
    }
};

export const deletePhone = async (data: string, setPhone: Function) => {
    try {
        setPhone(null);
    } catch (error) {
        log(error, 'Failed to remove phone no.');
    }
};
