import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { DeliveryServiceConnector } from './DeliveryServiceConnector';
import { getDeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import axios from 'axios';
import { ConnectDsResult } from '../auth/DeliveryServiceConnector';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';

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

    const [deliveryServiceTokens, setDeliveryServiceTokens] = useState<
        ConnectDsResult[]
    >([]);

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

                    return new DeliveryServiceConnector(
                        baseUrl,
                        dm3Configuration.resolverBackendUrl,
                        dm3Configuration.addressEnsSubdomain,
                        ethAddress!,
                        profileKeys!,
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
            setDeliveryServiceTokens(
                await Promise.all(
                    onlyValidConnectors.map((c) => c.login(signedUserProfile)),
                ),
            );

            setConnectors(onlyValidConnectors);
            console.log('connectors', onlyValidConnectors);
            setIsInitialized(true);
        };
        initializeDs();
    }, [isProfileReady]);

    const _getConnectors = () => {
        //TODO think about strategies to use the delivery services. For the start we just query the first one
        const [ds] = connectors;
        return [ds];
    };

    const getDeliveryServiceProperties = () => {
        const connectors = _getConnectors();
        return connectors.map((c) => c.getDeliveryServiceProperties());
    };

    const getDeliveryServiceTokens = () => {
        return deliveryServiceTokens.map((d) => d.deliveryServiceToken);
    };

    return {
        isInitialized,
        getDeliveryServiceProperties,
        getDeliveryServiceTokens,
        addNotificationChannel: (
            ensName: string,
            recipientValue: string,
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
        fetchPendingConversations: (ensName: string) => {
            return connectors[0].fetchPendingConversations(ensName);
        },
        fetchNewMessages: (ensName: string, contactAddress: string) => {
            return connectors[0].fetchNewMessages(ensName, contactAddress);
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
    };
};
