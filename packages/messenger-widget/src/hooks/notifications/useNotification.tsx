import { useContext, useEffect, useState } from 'react';
import { log } from '@dm3-org/dm3-lib-shared';
import {
    getAllNotificationChannels,
    getGlobalNotification,
    removeNotificationChannel,
    toggleGlobalNotifications,
    toggleNotificationChannel,
} from '@dm3-org/dm3-lib-delivery-api';
import {
    NotificationChannel,
    NotificationChannelType,
} from '@dm3-org/dm3-lib-shared';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { ModalContext } from '../../context/ModalContext';
import { closeLoader, startLoader } from '../../components/Loader/Loader';
import { IVerificationModal } from '../../components/Preferences/Notification/VerificationModal';
import { getVerficationModalContent } from '../../components/Preferences/Notification/hooks/VerificationContent';

export const useNotification = () => {
    const mainnetProvider = useMainnetProvider();

    const { account, deliveryServiceToken } = useContext(AuthContext);
    const { setLoaderContent } = useContext(ModalContext);

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
                const { data, status } = await getGlobalNotification(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                );
                if (status === 200) {
                    setIsNotificationsActive(data.isEnabled);
                    await fetchUserNotificationChannels();
                }
            } catch (error) {
                log(`Failed to fetch global notification : ${error}`, 'error');
            }
        }
    };

    // Fetches and sets all notification channels
    const fetchUserNotificationChannels = async () => {
        if (account && deliveryServiceToken) {
            try {
                const { data, status } = await getAllNotificationChannels(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                );
                if (status === 200) {
                    data.notificationChannels.forEach(
                        (channel: NotificationChannel) => {
                            switch (channel.type) {
                                case NotificationChannelType.EMAIL:
                                    if (channel.config.isVerified) {
                                        setEmail(channel.config.recipientValue);
                                    }
                                    setIsEmailActive(channel.config.isEnabled);
                                    break;
                                default:
                                    break;
                            }
                        },
                    );
                }
            } catch (error) {
                log(
                    `Failed to fetch notification channels : ${error}`,
                    'error',
                );
            }
        }
    };

    // Toggles global notification channel
    const toggleGlobalChannel = async (isEnabled: boolean) => {
        if (account && deliveryServiceToken) {
            try {
                setLoaderContent('Configuring global notification ...');
                startLoader();
                const { status } = await toggleGlobalNotifications(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    isEnabled,
                );
                if (status === 200 && isEnabled) {
                    await fetchUserNotificationChannels();
                }
                closeLoader();
            } catch (error) {
                log(`Failed to toggle global channel : ${error}`, 'error');
                closeLoader();
            }
        }
    };

    // Toggles specific notification channel
    const toggleSpecificNotificationChannel = async (
        isEnabled: boolean,
        notificationChannelType: NotificationChannelType,
        setChannelEnabled: (action: boolean) => void,
    ) => {
        if (account && deliveryServiceToken) {
            try {
                setChannelEnabled(isEnabled);
                const { status } = await toggleNotificationChannel(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    isEnabled,
                    notificationChannelType,
                );
                if (isEnabled && status === 200) {
                    await fetchUserNotificationChannels();
                }
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
                setLoaderContent(
                    `Removing ${channelType.toLowerCase()} channel...`,
                );
                startLoader();
                const { status } = await removeNotificationChannel(
                    account,
                    mainnetProvider,
                    deliveryServiceToken,
                    channelType,
                );
                if (status === 200) {
                    resetChannel(null);
                }
                closeLoader();
            } catch (error) {
                log(
                    `Failed to remove notification channel : ${error}`,
                    'error',
                );
                closeLoader();
            }
        }
    };

    useEffect(() => {
        const fetchNotificationDetails = async () => {
            await fetchGlobalNotification();
        };
        fetchNotificationDetails();
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
