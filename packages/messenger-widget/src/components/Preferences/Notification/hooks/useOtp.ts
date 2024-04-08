import { useContext, useEffect, useState } from 'react';
import { log } from '@dm3-org/dm3-lib-shared';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { AuthContext } from '../../../../context/AuthContext';
import {
    addNotificationChannel,
    sendOtp,
    verifyOtp,
} from '@dm3-org/dm3-lib-delivery-api';
import { useMainnetProvider } from '../../../../hooks/mainnetprovider/useMainnetProvider';
import { closeLoader, startLoader } from '../../../Loader/Loader';
import { GlobalContext } from '../../../../utils/context-utils';
import { ModalStateType } from '../../../../utils/enum-type-utils';

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
    const [otpData, setOtpData] = useState<string>('');
    const [isVerificationInProcess, setIsVerificationInProcess] =
        useState<boolean>(false);

    const mainnetProvider = useMainnetProvider();
    const { account, deliveryServiceToken } = useContext(AuthContext);
    const { dispatch } = useContext(GlobalContext);

    // Adds new notification channel & sends OTP
    const addNewNotificationChannel = async (
        channelType: NotificationChannelType,
        recipientValue: string,
    ) => {
        if (account && deliveryServiceToken) {
            return await addNotificationChannel(
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
            return await sendOtp(
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
            console.log('Verify method is calledd : ', otp);
            return await verifyOtp(
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
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Verifying OTP...',
            });
            startLoader();
            const { data, status } = await verifyChannelOtp(otp, channelType);
            if (status === 200) {
                setErrorMsg('');
                setShowError(false);
                setVerification(verificationData);
                closeModal(null);
            } else {
                setErrorMsg(data.error);
                setShowError(true);
            }
            closeLoader();
            setIsVerificationInProcess(false);
            setOtpData('');
        } catch (error) {
            log(error, 'OTP validation error');
            setErrorMsg('Invalid OTP');
            setShowError(true);
            closeLoader();
            setIsVerificationInProcess(false);
            setOtpData('');
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
            let response;
            if (isResendOtp) {
                dispatch({
                    type: ModalStateType.LoaderContent,
                    payload: 'Sending OTP...',
                });
                startLoader();
                response = await sendOtpForVerification(type);
            } else {
                dispatch({
                    type: ModalStateType.LoaderContent,
                    payload: `Configuring ${type.toLowerCase()} channel...`,
                });
                startLoader();
                response = await addNewNotificationChannel(type, inputData);
            }

            closeLoader();

            if (response && response.status === 200) {
                setShowError(false);
                setOtpSent(true);
                return true;
            } else {
                setErrorMsg(response.data.error);
                setShowError(true);
                setOtpSent(false);
                return false;
            }
        } catch (error) {
            log(error, 'Failed to send otp ');
            setErrorMsg('Failed to send OTP, please try again');
            setShowError(true);
            setOtpSent(false);
            closeLoader();
            return false;
        }
    };

    const handleInputChange = function (e: Event) {
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
                setOtpData(data);
                setIsVerificationInProcess(true);
            }
        }
    };

    // handles input field value change
    if (inputs) {
        inputs.addEventListener('input', handleInputChange);

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

    // Handles debouncing of API call to verify OTP
    useEffect(() => {
        if (isVerificationInProcess) {
            setTimeout(() => {
                validateOtp(
                    otpData,
                    verificationData,
                    setErrorMsg,
                    setShowError,
                    setVerification,
                    closeModal,
                );
            }, 1000);
        }
    }, [isVerificationInProcess]);

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
    };
};
