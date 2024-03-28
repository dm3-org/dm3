import { useState } from 'react';
import { DM3Configuration, Siwe } from '../../interfaces/config';
import { SiweValidityStatus } from '../../utils/enum-type-utils';
import { log } from '@dm3-org/dm3-lib-shared';
import { closeLoader } from '../../components/Loader/Loader';
import { openErrorModal } from '../../utils/common-utils';

export const useDm3Configuration = () => {
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

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

    const [siweValidityStatus, setSiweValidityStatus] =
        useState<SiweValidityStatus>(SiweValidityStatus.TO_BE_INITIATED);

    const validateSiweCredentials = async (data: Siwe) => {
        try {
            // Implement the logic, call the backend function
            const isValid = false;
            if (isValid) {
                setSiweValidityStatus(SiweValidityStatus.VALIDATED);
                closeLoader();
                return;
            }
            setSiweValidityStatus(SiweValidityStatus.ERROR);
            closeLoader();
            openErrorModal('Invalid SIWE credentials', false);
        } catch (error) {
            log(error, 'Error validating SIWE');
            setSiweValidityStatus(SiweValidityStatus.ERROR);
            closeLoader();
            openErrorModal('Invalid SIWE credentials', false);
        }
    };

    return {
        dm3Configuration,
        setDm3Configuration,
        screenWidth,
        setScreenWidth,
        siweValidityStatus,
        setSiweValidityStatus,
        validateSiweCredentials,
    };
};
