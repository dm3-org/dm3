import { useContext } from 'react';
import { DM3Name } from './../DM3Name';
import { NAME_TYPE } from '../../chain/common';
import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { createAlias } from '@dm3-org/dm3-lib-delivery-api';
import { AuthContext } from '../../../../context/AuthContext';
import { closeLoader, startLoader } from '../../../Loader/Loader';
import { claimSubdomain } from '../../../../adapters/offchainResolverApi';
import { ConfigureDM3NameContext } from '../../context/ConfigureDM3NameContext';
import { DM3ConfigurationContext } from '../../../../context/DM3ConfigurationContext';
import { useMainnetProvider } from '../../../../hooks/mainnetprovider/useMainnetProvider';
import { ModalContext } from '../../../../context/ModalContext';

export const ConfigureCloudNameProfile = () => {
    const mainnetProvider = useMainnetProvider();

    const { setLoaderContent } = useContext(ModalContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const { setExistingDm3Name, setError } = useContext(
        ConfigureDM3NameContext,
    );

    const { account, deliveryServiceToken, profileKeys, setDisplayName } =
        useContext(AuthContext);

    const nameExtension = globalConfig.USER_ENS_SUBDOMAIN();
    const placeholder = 'Enter your preferred name and check availability.';

    // Set new cloud DM3 username
    const submitDm3UsernameClaim = async (dm3UserEnsName: string) => {
        try {
            // start loader
            setLoaderContent('Publishing profile...');
            startLoader();

            const ensName = dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN();

            if (profileKeys) {
                await claimSubdomain(
                    dm3UserEnsName! + globalConfig.USER_ENS_SUBDOMAIN(),
                    dm3Configuration.resolverBackendUrl as string,
                    account!.ensName,
                    profileKeys.signingKeyPair.privateKey,
                );

                await createAlias(
                    account!,
                    mainnetProvider!,
                    account!.ensName,
                    ensName,
                    deliveryServiceToken!,
                );

                setDisplayName(ensName);
                setExistingDm3Name(ensName);
            }
        } catch (e) {
            setError('Name is not available', NAME_TYPE.DM3_NAME);
        }

        // stop loader
        closeLoader();
    };

    return (
        <DM3Name
            nameExtension={nameExtension}
            placeholder={placeholder}
            submitDm3UsernameClaim={submitDm3UsernameClaim}
        />
    );
};
