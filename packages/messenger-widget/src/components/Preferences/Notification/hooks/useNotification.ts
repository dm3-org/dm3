import { useContext, useEffect, useState } from 'react';
import {
    IVerificationModal,
    getVerficationModalContent,
} from './VerificationContent';
import { log } from '@dm3-org/dm3-lib-shared';
import {
    getAllNotificationChannels,
    getGlobalNotification,
    removeNotificationChannel,
    toggleGlobalNotifications,
    toggleNotificationChannel,
} from '@dm3-org/dm3-lib-delivery-api';
import { AuthContext } from '../../../../context/AuthContext';
import { useMainnetProvider } from '../../../../hooks/mainnetprovider/useMainnetProvider';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-delivery';

export const useNotification = () => {
    const { account, deliveryServiceToken } = useContext(AuthContext);
    const mainnetProvider = useMainnetProvider();

    // States for active notifications
    const [isNotificationsActive, setIsNotificationsActive] =
        useState<boolean>(false);
    const [isEmailActive, setIsEmailActive] = useState<boolean>(false);
    const [isMobileActive, setIsMobileActive] = useState<boolean>(false);
    const [isPushNotifyActive, setIsPushNotifyActive] =
        useState<boolean>(false);

    // States to manage email & phone no.
    const [email, setEmail] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);

    // States related to popup for verification
    const [activeVerification, setActiveVerification] = useState<
        NotificationChannelType | undefined
    >(undefined);

    const [activeVerificationContent, setActiveVerificationContent] =
        useState<IVerificationModal>(
            getVerficationModalContent(
                NotificationChannelType.EMAIL,
                setActiveVerification,
                setEmail,
            ),
        );

    const updateNotificationActive = async (action: boolean) => {
        setIsNotificationsActive(action);
        setIsEmailActive(action);
        setIsMobileActive(action);
        setIsPushNotifyActive(action);
        toggleGlobalChannel(action);
    };

    // Fetches and sets global notification
    const fetchGlobalNotification = async () => {
        if (account && deliveryServiceToken) {
            try {
                const notification = await getGlobalNotification(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                );
                setIsNotificationsActive(notification.isEnabled);
                await fetchUserNotificationChannels();
            } catch (error) {
                log(`Failed to fetch global notification : ${error}`, 'error');
            }
        }
    };

    // Fetches and sets all notification channels
    const fetchUserNotificationChannels = async () => {
        if (account && deliveryServiceToken) {
            try {
                const channels: any = await getAllNotificationChannels(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                );
                channels.notificationChannels.forEach(
                    (channel: NotificationChannel) => {
                        switch (channel.type) {
                            case NotificationChannelType.EMAIL:
                                setIsEmailActive(channel.config.isVerified);
                                setEmail(channel.config.recipientValue);
                                break;
                            default:
                                break;
                        }
                    },
                );
            } catch (error) {
                log(
                    `Failed to fetch notification channels : ${error}`,
                    'error',
                );
            }
        }
    };

    // Toggles global notification channel
    const toggleGlobalChannel = async (toggle: boolean) => {
        if (account && deliveryServiceToken) {
            try {
                await toggleGlobalNotifications(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    toggle,
                );
                await fetchUserNotificationChannels();
            } catch (error) {
                log(`Failed to toggle global channel : ${error}`, 'error');
            }
        }
    };

    // Toggles specific notification channel
    const toggleSpecificNotificationChannel = async (
        toggle: boolean,
        channelType: NotificationChannelType,
        setChannelEnabled: (action: boolean) => void,
    ) => {
        if (account && deliveryServiceToken) {
            try {
                setChannelEnabled(toggle);
                await toggleNotificationChannel(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    toggle,
                    channelType,
                );
                toggle && (await fetchUserNotificationChannels());
            } catch (error) {
                log(
                    `Failed to toggle notification channel : ${error}`,
                    'error',
                );
            }
        }
    };

    // Remove specific notification channel
    const removeSpecificNotificationChannel = async (
        channelType: NotificationChannelType,
        resetChannel: (action: null) => void,
    ) => {
        if (account && deliveryServiceToken) {
            try {
                await removeNotificationChannel(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    channelType,
                );
                resetChannel(null);
            } catch (error) {
                log(
                    `Failed to remove notification channel : ${error}`,
                    'error',
                );
            }
        }
    };

    useEffect(() => {
        fetchGlobalNotification();
    }, []);

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
        activeVerification,
        setActiveVerification,
        activeVerificationContent,
        setActiveVerificationContent,
        toggleSpecificNotificationChannel,
        removeSpecificNotificationChannel,
    };
};
