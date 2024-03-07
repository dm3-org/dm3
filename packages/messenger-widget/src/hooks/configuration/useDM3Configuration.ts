import { useState } from 'react';
import { DM3Configuration } from '../../interfaces/config';

export const useDm3Configuration = () => {
    const [dm3Configuration, setDm3Configuration] = useState<DM3Configuration>({
        defaultContact: '',
        defaultServiceUrl: '',
        ethereumProvider: '',
        walletConnectProjectId: '',
        userEnsSubdomain: '',
        addressEnsSubdomain: '',
        resolverBackendUrl: '',
        profileBaseUrl: '',
        defaultDeliveryService: '',
        backendUrl: '',
        chainId: '',
        resolverAddress: '',
        showAlways: true,
        showContacts: true,
    });

    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    return { dm3Configuration, setDm3Configuration, screenWidth, setScreenWidth };
};
