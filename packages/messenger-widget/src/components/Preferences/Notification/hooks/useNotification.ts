import { useContext, useEffect, useState } from 'react';
import {
    IVerificationModal,
    VerificationMethod,
    getVerficationModalContent,
} from './VerificationContent';
import { log } from '@dm3-org/dm3-lib-shared';
import { getAllNotificationChannels, getGlobalNotification, toggleGlobalNotifications } from '@dm3-org/dm3-lib-delivery-api';
import { AuthContext } from '../../../../context/AuthContext';
import { useMainnetProvider } from '../../../../hooks/mainnetprovider/useMainnetProvider';
import { NotificationChannel, NotificationChannelType } from '@dm3-org/dm3-lib-delivery';

export const useNotification = () => {

    const { account, deliveryServiceToken } = useContext(AuthContext);
    const mainnetProvider = useMainnetProvider();

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

    // Fetches and sets global notification
    const fetchGlobalNotification = async () => {
        if (account) {
            try {
                const notification = await getGlobalNotification(account, mainnetProvider);
                console.log("globa : ", notification);
                setIsNotificationsActive(notification.isEnabled);
            } catch (error) {
                log(`Failed to fetch global notification : ${error}`, "error");
            }
        }
    }

    // Fetches and sets all notification channels
    const fetchUserNotificationChannels = async () => {
        if (account) {
            try {
                const notificationChannels = await getAllNotificationChannels(account, mainnetProvider);
                notificationChannels.forEach((channel: NotificationChannel) => {
                    switch (channel.type) {
                        case NotificationChannelType.EMAIL:
                            setIsEmailActive(channel.config.isVerified);
                            setEmail(channel.config.recipientValue);
                            break;
                        default:
                            break;
                    }
                })
            } catch (error) {
                log(`Failed to fetch notification channels : ${error}`, "error");
            }
        }
    }

    // Toggles global notification channel
    const toggleGlobalChannel = async (toggleValue: boolean) => {
        if (account && deliveryServiceToken) {
            try {
                await toggleGlobalNotifications(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    toggleValue
                );
                console.log("Set global notification : success")
                // set this and other values accordingly
                // setIsNotificationsActive(notification.isEnabled);
            } catch (error) {
                log(`Failed to toggle global channel : ${error}`, "error");
            }
        }
    }

    useEffect(() => {
        toggleGlobalChannel(true);
    }, [])

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
