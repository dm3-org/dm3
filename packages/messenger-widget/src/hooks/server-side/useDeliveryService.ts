import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { getDeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import { DeliveryServiceConnector } from './DeliveryServiceConnector';

export const useDeliveryService = () => {
    //Get Dependencies from authHook

    const { ethAddress, profileKeys, account, isProfileReady } =
        useContext(AuthContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const mainnetProvider = useMainnetProvider();

    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    //Keep connectors in state
    const [connectors, setConnectors] = useState<DeliveryServiceConnector[]>(
        [],
    );

    //Initializer for the delivery service connectors
    useEffect(() => {
        const initializeDs = async () => {
            console.log('initialize useDelivery');
            if (!isProfileReady) {
                console.log('profile is not ready');
                return;
            }
            console.log('start getting ds');
            const deliveryServices = account?.profile?.deliveryServices ?? [];
            //Fetch DS profile for each DS

            const connectors = deliveryServices
                .map(async (dsName) => {
                    console.log('ds name', await dsName);
                    return await getDeliveryServiceProfile(
                        dsName,
                        mainnetProvider!,
                        async (url: string) => (await axios.get(url)).data,
                    );
                })
                .map(async (ds) => {
                    const baseUrl = (await ds)?.url;
                    if (baseUrl === undefined) {
                        console.log(
                            '[fetchDeliverServicePorfile] Cant resolve deliveryServiceUrl',
                        );
                        return undefined;
                    }

                    console.log('ds ', await ds);

                    return new DeliveryServiceConnector(
                        baseUrl,
                        dm3Configuration.resolverBackendUrl,
                        dm3Configuration.addressEnsSubdomain,
                        ethAddress!,
                        profileKeys!,
                        true,
                    );
                });

            const p = await Promise.all(connectors);
            const onlyValidConnectors = p.filter(
                (p): p is DeliveryServiceConnector => p !== undefined,
            );

            const signedUserProfile = {
                profile: account?.profile!,
                signature: account?.profileSignature!,
            };
            //Sign in connectors

            await Promise.all(
                onlyValidConnectors.map((c) => c.login(signedUserProfile)),
            ),
                setConnectors(onlyValidConnectors);
            console.log('connectors', onlyValidConnectors);
            setIsInitialized(true);
        };
        initializeDs();
    }, [isProfileReady]);

    const _getConnectors = () => {
        if (connectors.length === 0) {
            return [];
        }
        //TODO think about strategies to use the delivery services. For the start we just query the first one
        return [connectors[0]];
    };

    const getDeliveryServiceProperties = async (): Promise<any[]> => {
        const connectors = _getConnectors();
        return await Promise.all(
            connectors.map((c) => c.getDeliveryServiceProperties()),
        );
    };
    const onNewMessage = useCallback(
        (cb: OnNewMessagCallback) => {
            const connectors = _getConnectors();
            console.log('connectors', connectors);
            connectors.forEach((c) =>
                c.registerWebSocketListener('message', cb),
            );
        },
        [connectors],
    );

    const removeOnNewMessageListener = useCallback(() => {
        const connectors = _getConnectors();
        connectors.forEach((c) => c.unregisterWebSocketListener('message'));
    }, [connectors]);

    return {
        isInitialized,
        getDeliveryServiceProperties,
        addNotificationChannel: (
            ensName: string,
            recipientValue: string | PushSubscription,
            notificationChannelType: NotificationChannelType,
        ) => {
            return connectors[0]?.addNotificationChannel(
                ensName,
                recipientValue,
                notificationChannelType,
            );
        },
        sendOtp: (
            ensName: string,
            notificationChannelType: NotificationChannelType,
        ) => {
            return connectors[0]?.sendOtp(ensName, notificationChannelType);
        },
        verifyOtp: (
            ensName: string,
            otp: string,
            notificationChannelType: NotificationChannelType,
        ) => {
            return connectors[0].verifyOtp(
                ensName,
                otp,
                notificationChannelType,
            );
        },

        fetchNewMessages: (ensName: string, contactAddress: string) => {
            return connectors[0].fetchNewMessages(ensName, contactAddress);
        },
        fetchIncommingMessages: (ensName: string) => {
            return connectors[0].fetchIncommingMessages(ensName);
        },
        syncAcknowledgment: (
            ensName: string,
            acknoledgments: Acknoledgment[],
            lastSyncTime: number,
        ) => {
            return connectors[0].syncAcknowledgement(
                ensName,
                acknoledgments,
                lastSyncTime,
            );
        },
        getGlobalNotification: (ensName: string) => {
            return connectors[0].getGlobalNotification(ensName);
        },
        getAllNotificationChannels: (ensName: string) => {
            return connectors[0].getAllNotificationChannels(ensName);
        },
        toggleGlobalNotifications: (ensName: string, isEnabled: boolean) => {
            return connectors[0].toggleGlobalNotifications(ensName, isEnabled);
        },
        toggleNotificationChannel: (
            ensName: string,
            isEnabled: boolean,
            notificationChannelType: NotificationChannelType,
        ) => {
            return connectors[0].toggleNotificationChannel(
                ensName,
                isEnabled,
                notificationChannelType,
            );
        },
        removeNotificationChannel: (
            ensName: string,
            notificationChannelType: NotificationChannelType,
        ) => {
            return connectors[0].removeNotificationChannel(
                ensName,
                notificationChannelType,
            );
        },
        onNewMessage,
        removeOnNewMessageListener,
    };
};
export type OnNewMessagCallback = (envelop: EncryptionEnvelop) => void;
