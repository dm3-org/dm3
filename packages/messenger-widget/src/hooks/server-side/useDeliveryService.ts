import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { DeliveryServiceConnector } from './DeliveryServiceConnector';
import { getDeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import axios from 'axios';

export const useDeliveryService = () => {
    //Get Dependencies from authHook

    const { ethAddress, profileKeys, account, isProfileReady } =
        useContext(AuthContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const mainnetProvider = useMainnetProvider();

    //Keep connectors in state
    const [connectors, setConnectors] = useState<DeliveryServiceConnector[]>(
        [],
    );

    useEffect(() => {
        const initializeDs = async () => {
            console.log('initialize');
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
                    const resolverBackendUrl =
                        dm3Configuration.resolverBackendUrl;
                    const addrEnsSubdomain =
                        dm3Configuration.addressEnsSubdomain;
                    return new DeliveryServiceConnector(
                        baseUrl,
                        resolverBackendUrl,
                        addrEnsSubdomain,
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
            await Promise.all(
                onlyValidConnectors.map((c) => c.login(signedUserProfile)),
            );

            setConnectors(onlyValidConnectors);
            console.log('connectors', onlyValidConnectors);
        };
        initializeDs();
    }, [isProfileReady]);
};
