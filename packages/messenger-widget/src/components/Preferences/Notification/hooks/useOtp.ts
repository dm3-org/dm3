import { useContext, useEffect, useState } from 'react';
import { log } from '@dm3-org/dm3-lib-shared';
import { NotificationChannelType } from '@dm3-org/dm3-lib-delivery';
import { AuthContext } from '../../../../context/AuthContext';
import {
    addNotificationChannel,
    sendOtp,
    verifyOtp,
} from '@dm3-org/dm3-lib-delivery-api';
import { useMainnetProvider } from '../../../../hooks/mainnetprovider/useMainnetProvider';

export const otpContent = (type: NotificationChannelType) => {
    const email = 'Please enter the verification code, you received by email.';
    const mobile = 'Please enter the verification code, you received by SMS.';

    if (type === NotificationChannelType.EMAIL) {
        return email;
    }
    // else if (type === VerificationMethod.Telephone) {
    //     return mobile;
    // }

    return email;
};

export const useOtp = (
    channelType: NotificationChannelType,
    verificationData: string,
    setVerification: Function,
    closeModal: Function,
) => {
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inputs, setInputs] = useState<HTMLElement | null>(null);
    const [isCodeResent, setIsCodeResent] = useState<boolean>(false);

    const mainnetProvider = useMainnetProvider();
    const { account, deliveryServiceToken } = useContext(AuthContext);

    // Adds new notification channel & sends OTP
    const addNewNotificationChannel = async (
        channelType: NotificationChannelType,
        recipientValue: string,
    ) => {
        if (account && deliveryServiceToken) {
            await addNotificationChannel(
                account,
                mainnetProvider,
                deliveryServiceToken,
                recipientValue,
                channelType,
            );
        }
    };

    // Sends otp for existing notification channel for verification
    const sendOtpForVerification = async (
        channelType: NotificationChannelType,
    ) => {
        if (account && deliveryServiceToken) {
            await sendOtp(
                account,
                mainnetProvider,
                deliveryServiceToken,
                channelType,
            );
        }
    };

    // Verifies otp for notification channel
    const verifyChannelOtp = async (
        otp: string,
        channelType: NotificationChannelType,
    ) => {
        if (account && deliveryServiceToken) {
            await verifyOtp(
                account,
                mainnetProvider,
                deliveryServiceToken,
                otp,
                channelType,
            );
        }
    };

    const validateOtp = async (
        otp: string,
        verificationData: string,
        setErrorMsg: Function,
        setShowError: Function,
        setVerification: Function,
        closeModal: Function,
    ) => {
        try {
            await verifyChannelOtp(otp, channelType);
            setErrorMsg('');
            setShowError(false);
            setVerification(verificationData);
            closeModal(null);
        } catch (error) {
            log(error, 'OTP validation error');
            setErrorMsg('Invalid OTP');
            setShowError(true);
        }
    };

    const sendOtpToChannel = async (
        type: NotificationChannelType,
        inputData: string,
        setErrorMsg: Function,
        setShowError: Function,
        setOtpSent: Function,
        isResendOtp: boolean,
    ): Promise<boolean> => {
        try {
            if (isResendOtp) {
                await sendOtpForVerification(type);
            } else {
                await addNewNotificationChannel(type, inputData);
            }
            setShowError(false);
            setOtpSent(true);
            return true;
        } catch (error) {
            log(error, 'Failed to send otp ');
            setErrorMsg('Failed to add noti OTP, please try again');
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
                    setShowError(false);
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
                setShowError(false);
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
        sendOtpToChannel,
        validateOtp,
    };
};
