import { useState } from 'react';
import { useOtp } from './useOtp';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

export const useVerification = (
    closeModal: Function,
    setVerification: Function,
    channelType: NotificationChannelType,
) => {
    const [inputData, setInputData] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [otpSent, setOtpSent] = useState<boolean>(false);

    const { sendOtpToChannel } = useOtp(
        channelType,
        inputData,
        closeModal,
        setVerification,
    );

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
        type: NotificationChannelType,
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
            await sendOtpToChannel(
                type,
                inputData,
                setErrorMsg,
                setShowError,
                setOtpSent,
                false,
            );
        }
    };

    const validateInputData = (
        type: NotificationChannelType,
        inputData: string,
        setErrorMsg: Function,
        setShowError: Function,
    ): boolean => {
        /* eslint-disable max-len */
        const emailRegex =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        if (
            type === NotificationChannelType.EMAIL &&
            !emailRegex.test(inputData)
        ) {
            setErrorMsg('Please enter valid email ID');
            setShowError(true);
            return false;
        }
        // else if (
        //     type === NotificationChannelType.Telephone &&
        //     !phoneRegex.test(inputData)
        // ) {
        //     setErrorMsg('Please enter valid phone no.');
        //     setShowError(true);
        //     return false;
        // }

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
        validateInputData,
        submit,
        handleInputChange,
    };
};
