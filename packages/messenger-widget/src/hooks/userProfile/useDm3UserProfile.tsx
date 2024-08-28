import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { isValidName } from 'ethers/lib/utils';
import { updateProfile } from './../../adapters/offchainResolverApi';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ethers } from 'ethers';
import {
    Account,
    getUserProfile,
    UserProfile,
} from '@dm3-org/dm3-lib-profile';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import {
    fetchExistingDM3Name,
    fetchExistingEnsName,
    fetchExistingGnosisName,
    fetchExistingOpName,
} from '../../utils/names';
import { publishProfile } from '../../components/ConfigureProfile/dm3Names/optimismName/tx/publishProfile';
import { registerOpName } from '../../components/ConfigureProfile/dm3Names/optimismName/tx/registerOpName';
import { ModalContext } from '../../context/ModalContext';
import { closeLoader, startLoader } from '../../components/Loader/Loader';
import { submitGenomeNameTransaction } from '../../components/ConfigureProfile/chain/genome/bl';
import { submitEnsNameTransaction } from '../../components/ConfigureProfile/chain/ens/bl';
import { useChainId, useSwitchNetwork } from 'wagmi';
import {
    DM3_NAME_SERVICES,
    fetchChainIdFromDM3ServiceName,
    fetchChainIdFromServiceName,
    NAME_SERVICES,
} from '../../components/ConfigureProfile/bl';

export interface INodeDetails {
    dsNames: string[];
    profile: UserProfile;
}

export interface INameProfile {
    addrName: {
        profile: null | UserProfile;
        isActive: boolean;
    } | null;
    dm3Name: {
        profile: null | UserProfile;
        isActive: boolean;
    } | null;
    opName: {
        profile: null | UserProfile;
        isActive: boolean;
    } | null;
    gnosisName: {
        profile: null | UserProfile;
        isActive: boolean;
    } | null;
    ensName: {
        profile: null | UserProfile;
        isActive: boolean;
    } | null;
}

export const useDm3UserProfile = () => {
    const connectedChainId = useChainId();

    const { switchNetwork } = useSwitchNetwork({
        onSuccess: async () => {
            await executeTransaction();
        },
    });

    const mainnetProvider = useMainnetProvider();

    const { account, ethAddress } = useContext(AuthContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const { setLoaderContent } = useContext(ModalContext);

    const [nodes, setNodes] = useState<INodeDetails>({
        dsNames: account?.profile?.deliveryServices as string[],
        profile: account?.profile as UserProfile,
    });

    const [isModalOpenToAddNode, setIsModalOpenToAddNode] =
        useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);

    const [nodeName, setNodeName] = useState<string>('');

    const [profileName, setProfileName] = useState<string | null>(null);

    const [namesWithProfile, setNamesWithProfile] = useState<INameProfile>({
        addrName: null,
        dm3Name: null,
        opName: null,
        gnosisName: null,
        ensName: null,
    });

    // adds DS nodes in local storage of browser
    const setDsNodesInLocalStorage = (data: any) => {
        const stringifiedData = JSON.stringify(data);
        localStorage.setItem('ds_nodes', stringifiedData);
    };

    // retrieves DS nodes from local storage of browser
    const getDsNodesFromLocalStorage = (): INodeDetails => {
        const data = localStorage.getItem('ds_nodes');
        return data ? JSON.parse(data) : null;
    };

    const fetchUserProfileForAllNames = async (dsNodes: INodeDetails) => {
        if (ethAddress && dsNodes) {
            // fetch ADDR name, DM3 name, OP name, GNO name & ENS name
            const addressName = ethAddress.concat(
                dm3Configuration.addressEnsSubdomain,
            );

            const dm3Name = await fetchExistingDM3Name(
                account as Account,
                mainnetProvider,
                dm3Configuration,
                addressName,
            );

            const opName = await fetchExistingOpName(
                account as Account,
                mainnetProvider,
                dm3Configuration,
                addressName,
            );

            const ensName = await fetchExistingEnsName(
                account as Account,
                mainnetProvider,
                dm3Configuration,
                addressName,
            );

            const gnosisName = await fetchExistingGnosisName(
                account as Account,
                mainnetProvider,
                dm3Configuration,
                addressName,
            );

            // fetch user profiles for ADDR name, DM3 name, OP name, GNO name & ENS name
            const addressNameProfile = await getUserProfile(
                mainnetProvider,
                addressName,
            ).catch((e) => null);

            const dm3NameProfile = dm3Name
                ? await getUserProfile(mainnetProvider, dm3Name).catch(
                    (e) => null,
                )
                : null;

            const opNameProfile = opName
                ? await getUserProfile(mainnetProvider, opName).catch(
                    (e) => null,
                )
                : null;

            const ensNameProfile = ensName
                ? await getUserProfile(mainnetProvider, ensName).catch(
                    (e) => null,
                )
                : null;

            const gnosisNameProfile = gnosisName
                ? await getUserProfile(mainnetProvider, gnosisName).catch(
                    (e) => null,
                )
                : null;

            // update states to store the profle for each name
            setNamesWithProfile({
                addrName: {
                    profile: addressNameProfile?.profile ?? null,
                    isActive: !!addressNameProfile?.profile,
                },
                dm3Name: {
                    profile: dm3NameProfile?.profile ?? null,
                    isActive: !!dm3NameProfile?.profile,
                },
                opName: {
                    profile: opNameProfile?.profile ?? null,
                    isActive: !!opNameProfile?.profile,
                },
                ensName: {
                    profile: ensNameProfile?.profile ?? null,
                    isActive: !!ensNameProfile?.profile,
                },
                gnosisName: {
                    profile: gnosisNameProfile?.profile ?? null,
                    isActive: !!gnosisNameProfile?.profile,
                },
            });
        }
    };

    // Initializes user delivery services to show on Network screen
    const initialize = async () => {
        if (account?.profile) {
            // fetch DS nodes from profile
            const profileData = account.profile;
            const dsNodesFromProfile = {
                dsNames: profileData.deliveryServices,
                profile: account.profile,
            };

            // fetch DS nodes from local storage
            const dsNodeFromLocalStorage = getDsNodesFromLocalStorage();

            // filter out duplicate nodes
            const profileDsNodes = dsNodeFromLocalStorage
                ? dsNodeFromLocalStorage
                : dsNodesFromProfile;

            await fetchUserProfileForAllNames(profileDsNodes);

            // set nodes in the list to show on Network UI
            setNodes(profileDsNodes);
            return;
        }
    };

    const updateProfileForDm3AndAddressName = async (newNodes: string[]) => {
        // add those nodes to new profile
        const newProfile = { ...account?.profile! };
        newProfile.deliveryServices = newNodes;

        // create new profile object
        const signedUserProfile = {
            profile: newProfile,
            signature: account?.profileSignature!,
        };

        // update profile for address name
        const addrSubdomain = dm3Configuration.addressEnsSubdomain.substring(1);
        await updateProfile(
            ethAddress as string,
            dm3Configuration.resolverBackendUrl,
            addrSubdomain,
            signedUserProfile,
        );

        const addressName = ethAddress?.concat(
            dm3Configuration.addressEnsSubdomain,
        );

        // fetch existing DM3 name
        const dm3Name = await fetchExistingDM3Name(
            account as Account,
            mainnetProvider,
            dm3Configuration,
            addressName as string,
        );

        if (dm3Name && dm3Name.endsWith(dm3Configuration.userEnsSubdomain)) {
            //removes the leading . from the subdomain.
            //This is necessary as the resolver does not support subdomains with leading dots
            const dm3NameSubdomain =
                dm3Configuration.userEnsSubdomain.substring(1);
            await updateProfile(
                ethAddress as string,
                dm3Configuration.resolverBackendUrl,
                dm3NameSubdomain,
                signedUserProfile,
            );
        }

        return signedUserProfile.profile;
    };

    const updateProfileWithTransaction = async (
        existingName: string | null,
    ) => {
        // extract array of delivery service nodes names
        const newNodes = nodes.dsNames.map((n) => n);

        // add those nodes to new profile
        const newProfile: UserProfile = { ...account?.profile! };
        newProfile.deliveryServices = newNodes;

        // update account with new profile
        const updatedAccount: Account = { ...account } as Account;
        updatedAccount.profile = newProfile;

        // if no name found, don't update
        if (!existingName) {
            return;
        }

        setProfileName(existingName);

        // check its OPTIMISM name
        if (existingName.endsWith('.op.dm3.eth')) {
            const chainId = fetchChainIdFromDM3ServiceName(
                DM3_NAME_SERVICES.OPTIMISM,
                dm3Configuration.chainId,
            );

            changeNetwork(chainId);
        }

        // check its GNOSIS name
        if (
            existingName?.endsWith('.gno') ||
            existingName?.endsWith('.gnosis.eth')
        ) {
            const chainId = fetchChainIdFromServiceName(
                NAME_SERVICES.GENOME,
                dm3Configuration.chainId,
            );

            changeNetwork(chainId);
        }

        // check its ENS name
        if (existingName?.endsWith('.eth')) {
            const chainId = fetchChainIdFromServiceName(
                NAME_SERVICES.ENS,
                dm3Configuration.chainId,
            );

            changeNetwork(chainId);
        }
    };

    const executeTransaction = async () => {
        // extract array of delivery service nodes names
        const newNodes = nodes.dsNames.map((n) => n);

        // add those nodes to new profile
        const newProfile: UserProfile = { ...account?.profile! };
        newProfile.deliveryServices = newNodes;

        // update account with new profile
        const updatedAccount: Account = { ...account } as Account;
        updatedAccount.profile = newProfile;

        const provider = new ethers.providers.Web3Provider(
            window.ethereum as ethers.providers.ExternalProvider,
        );

        // if no name found, don't update
        if (!profileName) {
            return;
        }

        // check if its OPTIMISM name
        if (profileName.endsWith('.op.dm3.eth')) {
            // start loader
            setLoaderContent('Updating profile...');
            startLoader();

            try {
                await registerOpName(provider, () => { }, profileName);

                // do transaction
                await publishProfile(provider, updatedAccount, profileName);

                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }

        // check if its GNOSIS name
        if (
            profileName?.endsWith('.gno') ||
            profileName?.endsWith('.gnosis.eth')
        ) {
            // start loader
            setLoaderContent('Updating profile...');
            startLoader();

            try {
                await submitGenomeNameTransaction(
                    provider,
                    account!,
                    setLoaderContent,
                    profileName,
                    ethAddress!,
                    () => { },
                    () => { },
                );

                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }

        // check if its ENS name
        if (profileName?.endsWith('.eth')) {
            // start loader
            setLoaderContent('Updating profile...');
            startLoader();

            try {
                await submitEnsNameTransaction(
                    provider!,
                    account!,
                    ethAddress!,
                    setLoaderContent,
                    profileName,
                    () => { },
                    () => { },
                );

                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }
    };

    // Adds new node locally, whose profle has to be published
    const addNode = async () => {
        let result: boolean = true;

        // validate node name
        if (!isValidName(nodeName)) {
            result = false;
        }

        // node name must include . and end with .eth
        if (!nodeName.includes('.') || !nodeName.endsWith('.eth')) {
            result = false;
        }

        // set error if any validation fails
        if (!result) {
            setError('Invalid ENS name');
            return;
        }

        // set error if node already exists
        if (nodes.dsNames.filter((data) => data === nodeName).length) {
            setError('ENS name already exists');
            return;
        }

        // validate DS node by looking into ENS record
        if (!(await checkDsNameValidity(nodeName))) {
            setError('Invalid DS node name');
            return;
        }

        const updatedProfile = await updateProfileForDm3AndAddressName([
            ...nodes.dsNames,
            nodeName,
        ]);

        // update the DS nodes in local storage
        const updatedNodes = {
            dsNames: [...nodes.dsNames, nodeName],
            profile: updatedProfile,
        };

        // update nodes in local storage
        setDsNodesInLocalStorage(updatedNodes);

        // update node list
        setNodes(updatedNodes);

        // clear the input field
        setNodeName('');

        // clear all errors
        setError(null);

        // close the input field window
        setIsModalOpenToAddNode(false);
    };

    const deleteNode = async (id: number) => {
        // filter out node to delete
        const updatedNodes = nodes.dsNames.filter((d, i) => i !== id);

        // update profile for address and DM3 name
        const updatedProfile = await updateProfileForDm3AndAddressName(
            updatedNodes,
        );

        // updated nodes
        const newNodes = { dsNames: updatedNodes, profile: updatedProfile };

        // clear the input field
        setNodeName('');

        // clear all errors
        setError(null);

        // close the input field window
        setIsModalOpenToAddNode(false);

        // update nodes in local storage
        setDsNodesInLocalStorage(newNodes);

        // update node list
        setNodes(newNodes);
    };

    const checkIsProfileUpdated = (): boolean => {
        const { addrName, dm3Name, opName } = namesWithProfile;
        if (
            addrName &&
            addrName.isActive &&
            addrName.profile &&
            addrName.profile != nodes.profile
        ) {
            return false;
        }
        if (
            dm3Name &&
            dm3Name.isActive &&
            dm3Name.profile &&
            dm3Name.profile != nodes.profile
        ) {
            return false;
        }
        if (
            opName &&
            opName.isActive &&
            opName.profile &&
            opName.profile != nodes.profile
        ) {
            return false;
        }
        return isProfileUpdatedForEnsName();
    };

    const isProfileUpdated = useCallback(() => {
        return checkIsProfileUpdated();
    }, [nodes]);

    const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setNodeName(e.target.value);
    };

    const changeNetwork = (chainId: number) => {
        if (chainId !== connectedChainId && switchNetwork) {
            switchNetwork(chainId);
        }
    };

    const checkDsNameValidity = async (dsName: string): Promise<boolean> => {
        try {
            const resolver = await mainnetProvider.getResolver(dsName);
            if (resolver) {
                const dsProfile = await resolver.getText(
                    'network.dm3.deliveryService',
                );
                return !!dsProfile;
            }
            return false;
        } catch (error) {
            console.log('Invalid DN node : ', error);
            return false;
        }
    };

    const isProfileUpdatedForDm3Name = () => {
        const { opName } = namesWithProfile;
        if (
            opName &&
            opName.isActive &&
            opName.profile &&
            opName.profile != nodes.profile
        ) {
            return false;
        }
        return true;
    };

    const isProfileUpdatedForEnsName = () => {
        const { ensName, gnosisName } = namesWithProfile;
        if (
            ensName &&
            ensName.isActive &&
            ensName.profile &&
            ensName.profile != nodes.profile
        ) {
            return false;
        }
        if (
            gnosisName &&
            gnosisName.isActive &&
            gnosisName.profile &&
            gnosisName.profile != nodes.profile
        ) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        initialize();
    }, [account?.ensName]);

    return {
        initialize,
        addNode,
        updateProfileWithTransaction,
        deleteNode,
        nodes,
        isModalOpenToAddNode,
        setIsModalOpenToAddNode,
        error,
        setError,
        nodeName,
        setNodeName,
        handleNodeNameChange,
        updateProfileForDm3AndAddressName,
        isProfileUpdated,
        isProfileUpdatedForDm3Name,
        isProfileUpdatedForEnsName,
    };
};
