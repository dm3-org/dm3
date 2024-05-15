import React from 'react';
import { useNotification } from './../hooks/notifications/useNotification';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { IVerificationModal } from '../components/Preferences/Notification/VerificationModal';

export type NotificationContextType = {
    isNotificationsActive: boolean;
    isEmailActive: boolean;
    setIsEmailActive: (active: boolean) => void;
    isMobileActive: boolean;
    setIsMobileActive: (active: boolean) => void;
    isPushNotifyActive: boolean;
    setIsPushNotifyActive: (active: boolean) => void;
    email: string | null;
    setEmail: (email: string | null) => void;
    phone: string | null;
    setPhone: (email: string | null) => void;
    updateNotificationActive: (action: boolean) => void;
    activeVerification: NotificationChannelType | undefined;
    setActiveVerification: (
        active: NotificationChannelType | undefined,
    ) => void;
    activeVerificationContent: IVerificationModal;
    setActiveVerificationContent: (active: IVerificationModal) => void;
    toggleSpecificNotificationChannel: (
        toggle: boolean,
        channelType: NotificationChannelType,
        setChannelEnabled: (action: boolean) => void,
    ) => void;
    removeSpecificNotificationChannel: (
        channelType: NotificationChannelType,
        resetChannel: (action: null) => void,
    ) => void;
    isLoading: boolean;
    loaderData: string;
};

export const NotificationContext = React.createContext<NotificationContextType>(
    {
        isNotificationsActive: false,
        isEmailActive: false,
        setIsEmailActive: (active: boolean) => {},
        isMobileActive: false,
        setIsMobileActive: (active: boolean) => {},
        isPushNotifyActive: false,
        setIsPushNotifyActive: (active: boolean) => {},
        email: null,
        setEmail: (email: string | null) => {},
        phone: null,
        setPhone: (email: string | null) => {},
        updateNotificationActive: (action: boolean) => {},
        activeVerification: undefined,
        setActiveVerification: (
            active: NotificationChannelType | undefined,
        ) => {},
        activeVerificationContent: {
            heading: '',
            description: '',
            type: NotificationChannelType.EMAIL,
            placeholder: '',
            content: '',
            action: () => {},
            setVerification: () => {},
        },
        setActiveVerificationContent: (active: IVerificationModal) => {},
        toggleSpecificNotificationChannel: (
            toggle: boolean,
            channelType: NotificationChannelType,
            setChannelEnabled: (action: boolean) => void,
        ) => {},
        removeSpecificNotificationChannel: (
            channelType: NotificationChannelType,
            resetChannel: (action: null) => void,
        ) => {},
        isLoading: false,
        loaderData: '',
    },
);

export const NotificationContextProvider = ({
    children,
}: {
    children?: any;
}) => {
    const {
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
        isLoading,
        loaderData,
    } = useNotification();

    return (
        <NotificationContext.Provider
            value={{
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
                isLoading,
                loaderData,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
