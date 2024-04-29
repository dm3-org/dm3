import { useState } from 'react';
import { DM3Configuration, Siwe } from '../../interfaces/config';
import { SiweValidityStatus } from '../../utils/enum-type-utils';
import { closeLoader } from '../../components/Loader/Loader';
import { openErrorModal } from '../../utils/common-utils';
import { log } from '@dm3-org/dm3-lib-shared';

export const useDm3Configuration = () => {
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    const [siweValidityStatus, setSiweValidityStatus] =
        useState<SiweValidityStatus>(SiweValidityStatus.TO_BE_INITIATED);

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
        genomeRegistryAddress: '',
        showAlways: true,
        showContacts: true,
    });

    const validateSiweCredentials = async (data: Siwe) => {
        try {
            // Implement the logic, call the backend function to check siwe is valid
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
