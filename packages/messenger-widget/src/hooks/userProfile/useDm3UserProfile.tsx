import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { isValidName } from 'ethers/lib/utils';
import { updateProfile } from './../../adapters/offchainResolverApi';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ethers } from 'ethers';
import {
    Account,
    getProfileCreationMessage,
    getUserProfile,
    SignedUserProfile,
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
import { useChainId, useSwitchNetwork, useWalletClient } from 'wagmi';
import { stringify } from '@dm3-org/dm3-lib-shared';
import {
    DM3_NAME_SERVICES,
    fetchChainIdFromDM3ServiceName,
    fetchChainIdFromServiceName,
    NAME_SERVICES,
} from '../../components/ConfigureProfile/bl';

export interface INodeDetails {
    dsNames: string[];
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

    const { data: walletClient } = useWalletClient();

    const mainnetProvider = useMainnetProvider();

    const { account, ethAddress } = useContext(AuthContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const { setLoaderContent } = useContext(ModalContext);

    const [nodes, setNodes] = useState<INodeDetails>({
        dsNames: account?.profile?.deliveryServices as string[],
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

    // fetches profile for the names like ADDR, DM3, OP, GNO and ENS
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

            console.log(
                'profile data tracked : ',
                addressName,
                addressNameProfile,
            );

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
            const dsNodesFromProfile: INodeDetails = {
                dsNames: profileData.deliveryServices,
            };

            console.log('my profile data is : ', profileData);

            // fetch DS nodes from local storage
            const dsNodeFromLocalStorage = getDsNodesFromLocalStorage();

            // filter out duplicate nodes
            const profileDsNodes: INodeDetails = dsNodeFromLocalStorage
                ? dsNodeFromLocalStorage
                : dsNodesFromProfile;

            if (!dsNodeFromLocalStorage) {
                setDsNodesInLocalStorage(profileDsNodes);
            }

            // fetches all profiles of a account
            await fetchUserProfileForAllNames(profileDsNodes);

            // set nodes in the list to show on Network UI
            setNodes(profileDsNodes);
            return;
        }
    };

    const updateProfileForAddressOrDm3Name = async (nameType: string) => {
        // add those nodes to new profile
        const newProfile = { ...account?.profile! };
        newProfile.deliveryServices = nodes.dsNames;

        // fetch subdomain for ADDR name or DM3 name
        const subdomain =
            nameType === 'ADDR'
                ? dm3Configuration.addressEnsSubdomain.substring(1)
                : dm3Configuration.userEnsSubdomain.substring(1);

        // fetch profile creation message to update the profile
        const profileCreationMessage = getProfileCreationMessage(
            stringify(newProfile),
            ethAddress as string,
        );

        // sign the message to update the profile
        const signature = await walletClient?.signMessage({
            message: profileCreationMessage,
        });

        // create new profile object
        const signedUserProfile = {
            profile: newProfile,
            signature: signature,
        } as SignedUserProfile;

        // update profile
        const success = await updateProfile(
            ethAddress as string,
            dm3Configuration.resolverBackendUrl,
            subdomain,
            signedUserProfile,
        );

        // update the profile state of ADDR name
        if (success && nameType === 'ADDR') {
            setNamesWithProfile((prev) => {
                return {
                    ...prev,
                    addrName: { profile: newProfile, isActive: true },
                };
            });
        }

        // update the profile state of DM3 name
        if (success && nameType === 'DM3') {
            setNamesWithProfile((prev) => {
                return {
                    ...prev,
                    dm3Name: { profile: newProfile, isActive: true },
                };
            });
        }
    };

    /**
     * Changes network to update the profile on particular blockchain
     */
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

    /**
     * Executes blockchain transaction to update profile on OP, GNO and ENS name
     */
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
                await registerOpName(provider, () => {}, profileName);

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
                    () => {},
                    () => {},
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
                    () => {},
                    () => {},
                );

                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }
    };

    /**
     * Adds node to the local storage
     */
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

        // update the DS nodes in local storage
        const updatedNodes = {
            dsNames: [...nodes.dsNames, nodeName],
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

    /**
     * Deletes node from the local storage
     */
    const deleteNode = async (id: number) => {
        // filter out node to delete
        const updatedNodes = nodes.dsNames.filter((d, i) => i !== id);

        // updated nodes
        const newNodes = { dsNames: updatedNodes };

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

    /**
     * Check profile is updated for ADDR name or not.
     * If its not updated return false.
     * Check profile is updated for DM3 name or not.
     * If its not updated return false.
     * If DM3 name profile is updated, then check ENS name profile and return true/false.
     */
    const isProfileUpdated = useCallback(() => {
        return !isProfileUpdatedForAddrName()
            ? false
            : !isProfileUpdatedForDm3Name()
            ? false
            : isProfileUpdatedForEnsName();
    }, [nodes, namesWithProfile]);

    const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setNodeName(e.target.value);
    };

    const changeNetwork = (chainId: number) => {
        if (chainId !== connectedChainId && switchNetwork) {
            switchNetwork(chainId);
        }
    };

    /**
     * Validates DS name is actually a delivery service or not
     */
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

    /**
     * Checks the address name profile is updated or not
     */
    const isProfileUpdatedForAddrName = useCallback(() => {
        const { addrName } = namesWithProfile;
        console.log('======================', addrName);
        console.log('----------------------', nodes);
        if (
            addrName &&
            addrName.isActive &&
            addrName.profile &&
            JSON.stringify(addrName.profile.deliveryServices) !==
                JSON.stringify(nodes.dsNames)
        ) {
            return false;
        }
        return true;
    }, [namesWithProfile]);

    /**
     * Checks the DM3/OP name profile is updated or not
     */
    const isProfileUpdatedForDm3Name = useCallback(() => {
        const { dm3Name, opName } = namesWithProfile;
        if (
            dm3Name &&
            dm3Name.isActive &&
            dm3Name.profile &&
            JSON.stringify(dm3Name.profile.deliveryServices) !==
                JSON.stringify(nodes.dsNames)
        ) {
            return false;
        }
        if (
            opName &&
            opName.isActive &&
            opName.profile &&
            JSON.stringify(opName.profile.deliveryServices) !==
                JSON.stringify(nodes.dsNames)
        ) {
            return false;
        }
        return true;
    }, [namesWithProfile]);

    /**
     * Checks the ENS/GNO name profile is updated or not
     */
    const isProfileUpdatedForEnsName = useCallback(() => {
        const { ensName, gnosisName } = namesWithProfile;
        if (
            ensName &&
            ensName.isActive &&
            ensName.profile &&
            JSON.stringify(ensName.profile.deliveryServices) !==
                JSON.stringify(nodes.dsNames)
        ) {
            return false;
        }
        if (
            gnosisName &&
            gnosisName.isActive &&
            gnosisName.profile &&
            JSON.stringify(gnosisName.profile.deliveryServices) !==
                JSON.stringify(nodes.dsNames)
        ) {
            return false;
        }
        return true;
    }, [namesWithProfile]);

    useEffect(() => {
        initialize();
    }, [account?.ensName]);

    return {
        initialize,
        addNode,
        updateProfileForAddressOrDm3Name,
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
        isProfileUpdated,
        isProfileUpdatedForAddrName,
        isProfileUpdatedForDm3Name,
        isProfileUpdatedForEnsName,
    };
};
