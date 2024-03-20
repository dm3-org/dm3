import { useState } from 'react';
import {
    IVerificationModal,
    VerificationMethod,
    getVerficationModalContent,
} from './VerificationContent';
import { log } from '@dm3-org/dm3-lib-shared';

export const useNotification = () => {
    // States for active notifications
    const [isNotificationsActive, setIsNotificationsActive] =
        useState<boolean>(true);
    const [isEmailActive, setIsEmailActive] = useState<boolean>(true);
    const [isMobileActive, setIsMobileActive] = useState<boolean>(true);
    const [isPushNotifyActive, setIsPushNotifyActive] = useState<boolean>(true);

    // States to manage email & phone no.
    const [email, setEmail] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);

    // States related to popup for verification
    const [activeVerification, setActiveVerification] = useState<
        VerificationMethod | undefined
    >(undefined);

    const [activeVerificationContent, setActiveVerificationContent] =
        useState<IVerificationModal>(
            getVerficationModalContent(
                VerificationMethod.Email,
                setActiveVerification,
                setEmail,
            ),
        );

    const updateNotificationActive = (action: boolean) => {
        setIsNotificationsActive(action);
        setIsEmailActive(action);
        setIsMobileActive(action);
        setIsPushNotifyActive(action);
    };

    const deleteEmail = async () => {
        try {
            setEmail(null);
        } catch (error) {
            log(error, 'Failed to remove email ID');
        }
    };

    const deletePhone = async () => {
        try {
            setPhone(null);
        } catch (error) {
            log(error, 'Failed to remove phone no.');
        }
    };

    return {
        isNotificationsActive,
        isEmailActive,
        setIsEmailActive,
        isMobileActive,
        setIsMobileActive,
        isPushNotifyActive,
        setIsPushNotifyActive,
        email,
        setEmail,
        phone,
        setPhone,
        updateNotificationActive,
        deleteEmail,
        deletePhone,
        activeVerification,
        setActiveVerification,
        activeVerificationContent,
        setActiveVerificationContent,
    };
};
