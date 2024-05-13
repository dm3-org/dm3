import { ethers } from 'ethers';
import { useContext } from 'react';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../../../context/AuthContext';
import { ConfigureDM3NameContext } from '../../context/ConfigureDM3NameContext';
import { closeLoader, startLoader } from './../../../Loader/Loader';
import { IChain, NAME_TYPE } from './../../chain/common';
import { DM3Name } from './../DM3Name';
import { publishProfile } from './tx/publishProfile';
import { registerOpName } from './tx/registerOpName';
import { ModalContext } from '../../../../context/ModalContext';

export const ConfigureOptimismNameProfile = (props: IChain) => {
    const { setLoaderContent } = useContext(ModalContext);
    const { setExistingDm3Name, setError } = useContext(
        ConfigureDM3NameContext,
    );
    const chainId = useChainId();

    const { account, setDisplayName } = useContext(AuthContext);

    // Modify it as per actual op name extension. It's written as per figma design.
    const nameExtension = '.op.dm3.eth';
    const placeholder = 'Enter your preferred name and check availability.';

    // Set new OP DM3 username
    const registerOpNameAndPublishProfile = async (opName: string) => {
        try {
            // start loader
            setLoaderContent('Claim OP name...');
            startLoader();

            if (props.chainToConnect !== chainId) {
                console.log(
                    'Invalid chain connected. Please switch to optimism network.',
                );
                setError(
                    'Invalid chain connected. Please switch to optimism network.',
                    NAME_TYPE.DM3_NAME,
                );
                closeLoader();

                return;
            }
            const opProvider = new ethers.providers.Web3Provider(
                window.ethereum as ethers.providers.ExternalProvider,
            );
            const opParentDomain = '.op.dm3.eth';
            const ensName = `${opName}${opParentDomain}`;
            const registerNameRes = await registerOpName(
                opProvider,
                setError,
                ensName,
            );

            if (!registerNameRes) {
                closeLoader();
                return;
            }

            setLoaderContent('Publishing profile...');
            await publishProfile(opProvider, account!, ensName);

            setDisplayName(ensName);
            setExistingDm3Name(ensName);
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
            submitDm3UsernameClaim={registerOpNameAndPublishProfile}
        />
    );
};
