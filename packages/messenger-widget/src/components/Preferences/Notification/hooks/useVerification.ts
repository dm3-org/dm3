import { useState } from 'react';
import { VerificationMethod } from './VerificationContent';
import { useOtp } from './useOtp';

export const useVerification = (
    closeModal: Function,
    setVerification: Function,
) => {
    const [inputData, setInputData] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [otpSent, setOtpSent] = useState<boolean>(false);

    const { sendOtp } = useOtp(inputData, closeModal, setVerification);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setInputData: Function,
        setErrorMsg: Function,
        setShowError: Function,
    ) => {
        setErrorMsg('');
        setShowError(false);
        setInputData(e.target.value);
    };

    const submit = async (
        e: React.FormEvent,
        type: VerificationMethod,
        inputData: string,
        setErrorMsg: Function,
        setShowError: Function,
        setOtpSent: Function,
    ) => {
        e.preventDefault();
        const check = validateInputData(
            type,
            inputData,
            setErrorMsg,
            setShowError,
        );
        if (check) {
            await sendOtp(
                type,
                inputData,
                setErrorMsg,
                setShowError,
                setOtpSent,
            );
        }
    };

    const validateInputData = (
        type: VerificationMethod,
        inputData: string,
        setErrorMsg: Function,
        setShowError: Function,
    ): boolean => {
        /* eslint-disable max-len */
        const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        if (type === VerificationMethod.Email && !emailRegex.test(inputData)) {
            setErrorMsg('Please enter valid email ID');
            setShowError(true);
            return false;
        } else if (
            type === VerificationMethod.Telephone &&
            !phoneRegex.test(inputData)
        ) {
            setErrorMsg('Please enter valid phone no.');
            setShowError(true);
            return false;
        }

        return true;
    };

    const resendOtp = async (): Promise<boolean> => {
        // return await sendOtp(
        //     props.type,
        //     inputData,
        //     setErrorMsg,
        //     setShowError,
        //     setOtpSent,
        // );
        return true;
    };

    return {
        inputData,
        setInputData,
        showError,
        setShowError,
        errorMsg,
        setErrorMsg,
        otpSent,
        setOtpSent,
        resendOtp,
        validateInputData,
        submit,
        handleInputChange,
    };
};
