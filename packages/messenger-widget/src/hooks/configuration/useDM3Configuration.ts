import { useState } from 'react';
import { DM3Configuration, Siwe } from '../../interfaces/config';
import { SiweValidityStatus } from '../../utils/enum-type-utils';
import { closeLoader } from '../../components/Loader/Loader';
import { openErrorModal } from '../../utils/common-utils';
import { log } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import { formatAddress } from '@dm3-org/dm3-lib-profile';

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
        showAlways: true,
        showContacts: true,
        publicVapidKey: '',
    });

    const validateSiweCredentials = async (data: Siwe) => {
        console.log('Validating SIWE credentials');

        try {
            // Implement the logic, call the backend function to check siwe is valid
            const isValidSiwe =
                ethers.utils.recoverAddress(
                    ethers.utils.hashMessage(data.message),
                    data.signature,
                ) === formatAddress(data.address);
            if (isValidSiwe) {
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
