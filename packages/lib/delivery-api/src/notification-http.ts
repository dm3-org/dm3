import axios from 'axios';
import {
    Account,
    getDeliveryServiceClient,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { checkAccount, getAxiosConfig } from './utils';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

const NOTIFICATIONS_PATH = process.env.REACT_APP_BACKEND + '/notifications';

/**
 * toggles global notification (enable/disable)
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param isEnabled reflects to enable or disable
 */
export async function toggleGlobalNotifications(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    isEnabled: boolean,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/global/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.post(url)).data,
    ).post(url, { isEnabled }, getAxiosConfig(token));

    return { data, status };
}
export type ToggleGlobalNotifications = typeof toggleGlobalNotifications;

/**
 * fetchs the global notifications configured or not for a given account
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 */
export async function getGlobalNotification(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/global/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return { data, status };
}
export type GetGlobalNotification = typeof getGlobalNotification;

/**
 * adds new notification channel for the user
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param recipientValue The emailID, mobileNo, etc.. for notifications
 * @param notificationChannelType Notification channel type
 */
export async function addNotificationChannel(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    recipientValue: string,
    notificationChannelType: NotificationChannelType,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.post(url)).data,
    ).post(
        url,
        {
            recipientValue,
            notificationChannelType,
        },
        getAxiosConfig(token),
    );

    return { data, status };
}
export type AddNotificationChannel = typeof addNotificationChannel;

/**
 * fetchs all the notifications channels for a given account
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 */
export async function getAllNotificationChannels(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.get(url)).data,
    ).get(url, getAxiosConfig(token));

    return { data, status };
}
export type GetAllNotificationChannels = typeof getAllNotificationChannels;

/**
 * send OTP to specific notification channel of the user
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param notificationChannelType Notification channel type
 */
export async function sendOtp(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    notificationChannelType: NotificationChannelType,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/otp/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.post(url)).data,
    ).post(
        url,
        {
            notificationChannelType,
        },
        getAxiosConfig(token),
    );

    return { data, status };
}
export type SendOtp = typeof sendOtp;

/**
 * verifies the OTP of specific notification channel of the user
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param otp The otp to be verified
 * @param notificationChannelType Notification channel type
 */
export async function verifyOtp(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    otp: string,
    notificationChannelType: NotificationChannelType,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/otp/verify/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.post(url)).data,
    ).post(
        url,
        {
            otp,
            notificationChannelType,
        },
        getAxiosConfig(token),
    );

    return { data, status };
}
export type VerifyOtp = typeof verifyOtp;

/**
 * enables or disables specific notification channel of the user
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param isEnabled The boolean value to enable or disable
 * @param notificationChannelType Notification channel type
 */
export async function toggleNotificationChannel(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    isEnabled: boolean,
    notificationChannelType: NotificationChannelType,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/channel/${normalizeEnsName(ensName)}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.post(url)).data,
    ).post(
        url,
        {
            isEnabled,
            notificationChannelType,
        },
        getAxiosConfig(token),
    );

    return { data, status };
}

export type ToggleNotificationChannel = typeof toggleNotificationChannel;

/**
 * removes specific notification channel of the user
 * @param account The dm3 account
 * @param provider Ethers provider
 * @param token The auth token
 * @param channelType Notification channel type
 */
export async function removeNotificationChannel(
    account: Account,
    provider: ethers.providers.JsonRpcProvider,
    token: string,
    channelType: NotificationChannelType,
): Promise<any> {
    const { profile, ensName } = checkAccount(account);

    const url = `${NOTIFICATIONS_PATH}/channel/${channelType}/${normalizeEnsName(
        ensName,
    )}`;

    const { data, status } = await getDeliveryServiceClient(
        profile,
        provider,
        async (url: string) => (await axios.delete(url)).data,
    ).delete(url, getAxiosConfig(token));

    return { data, status };
}

export type RemoveNotificationChannel = typeof removeNotificationChannel;
