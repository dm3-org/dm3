import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { isValidName } from 'ethers/lib/utils';
import { updateProfile } from './../../adapters/offchainResolverApi';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ethers } from 'ethers';
import { Account, getUserProfile, UserProfile } from '@dm3-org/dm3-lib-profile';
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
    dsName: string;
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

    const [nodes, setNodes] = useState<INodeDetails[]>([]);

    const [isModalOpenToAddNode, setIsModalOpenToAddNode] =
        useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);

    const [nodeName, setNodeName] = useState<string>('');

    const [profileName, setProfileName] = useState<string | null>(null);

    const [isDm3NameConfigured, setIsDm3NameConfigured] =
        useState<boolean>(false);

    const [isEnsNameConfigured, setIsEnsNameConfigured] =
        useState<boolean>(false);

    // adds DS nodes in local storage of browser
    const setDsNodesInLocalStorage = (data: any) => {
        const stringifiedData = JSON.stringify(data);
        localStorage.setItem('ds_nodes', stringifiedData);
    };

    // retrieves DS nodes from local storage of browser
    const getDsNodesFromLocalStorage = (): INodeDetails[] => {
        const data = localStorage.getItem('ds_nodes');
        return data ? JSON.parse(data) : [];
    };

    const fetchUserProfileForAllNames = async (
        dsNodes: INodeDetails[],
        isLocalStorageData: boolean,
    ): Promise<INodeDetails[]> => {
        if (ethAddress && dsNodes.length) {
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

            setIsDm3NameConfigured(dm3Name || opName ? true : false);
            setIsEnsNameConfigured(ensName || gnosisName ? true : false);

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

            let isAddressNameActive: boolean = false;
            let isDm3NameActive: boolean = false;
            let isOpNameActive: boolean = false;
            let isEnsNameActive: boolean = false;
            let isGnosisNameActive: boolean = false;

            // 1. local storage has ds node and login account profile matches with localsotrage profile
            // 2. OR local storage is empty & DS from logged in profile has to be checked for updated profile
            if (
                (isLocalStorageData &&
                    dsNodes[dsNodes.length - 1].addrName?.profile ===
                        addressNameProfile?.profile) ||
                (!isLocalStorageData && addressNameProfile)
            ) {
                isAddressNameActive = true;
            }

            // 1. local storage has ds node and login account profile matches with localsotrage profile
            // 2. OR local storage is empty & DS from logged in profile has to be checked for updated profile
            if (
                (isLocalStorageData &&
                    dm3NameProfile &&
                    dsNodes[dsNodes.length - 1].dm3Name?.profile ===
                        dm3NameProfile.profile) ||
                (!isLocalStorageData && dm3NameProfile)
            ) {
                isDm3NameActive = true;
            }

            // 1. local storage has ds node and login account profile matches with localsotrage profile
            // 2. OR local storage is empty & DS from logged in profile has to be checked for updated profile
            if (
                (isLocalStorageData &&
                    opNameProfile &&
                    dsNodes[dsNodes.length - 1].opName?.profile ===
                        opNameProfile.profile) ||
                (!isLocalStorageData && opNameProfile)
            ) {
                isOpNameActive = true;
            }

            // 1. local storage has ds node and login account profile matches with localsotrage profile
            // 2. OR local storage is empty & DS from logged in profile has to be checked for updated profile
            if (
                (isLocalStorageData &&
                    ensNameProfile &&
                    dsNodes[dsNodes.length - 1].ensName?.profile ===
                        ensNameProfile.profile) ||
                (!isLocalStorageData && ensNameProfile)
            ) {
                isEnsNameActive = true;
            }

            // 1. local storage has ds node and login account profile matches with localsotrage profile
            // 2. OR local storage is empty & DS from logged in profile has to be checked for updated profile
            if (
                (isLocalStorageData &&
                    gnosisNameProfile &&
                    dsNodes[dsNodes.length - 1].gnosisName?.profile ===
                        gnosisNameProfile.profile) ||
                (!isLocalStorageData && gnosisNameProfile)
            ) {
                isGnosisNameActive = true;
            }

            const updatedProfile: INodeDetails[] = dsNodes.map((data) => {
                return {
                    dsName: data.dsName,
                    addrName: isAddressNameActive
                        ? {
                              profile:
                                  addressNameProfile?.profile as UserProfile,
                              isActive: true,
                          }
                        : data.addrName,
                    dm3Name: isDm3NameActive
                        ? {
                              profile: dm3NameProfile?.profile as UserProfile,
                              isActive: true,
                          }
                        : data.dm3Name,
                    opName: isOpNameActive
                        ? {
                              profile: opNameProfile?.profile as UserProfile,
                              isActive: true,
                          }
                        : data.opName,
                    gnosisName: isGnosisNameActive
                        ? {
                              profile:
                                  gnosisNameProfile?.profile as UserProfile,
                              isActive: true,
                          }
                        : data.gnosisName,
                    ensName: isEnsNameActive
                        ? {
                              profile: ensNameProfile?.profile as UserProfile,
                              isActive: true,
                          }
                        : data.ensName,
                };
            });

            return updatedProfile;
        }
        return [];
    };

    // Initializes user delivery services to show on Network screen
    const initialize = async () => {
        if (account?.profile) {
            // fetch DS nodes from profile
            const profileData = account.profile;
            const dsNodesFromProfile = profileData.deliveryServices.map(
                (dsNode) => {
                    return {
                        dsName: dsNode,
                        addrName: null,
                        dm3Name: null,
                        opName: null,
                        gnosisName: null,
                        ensName: null,
                    };
                },
            );

            // fetch DS nodes from local storage
            const dsNodeFromLocalStorage = getDsNodesFromLocalStorage();

            // filter out duplicate nodes
            const profileDsNodes = dsNodeFromLocalStorage
                ? dsNodeFromLocalStorage
                : dsNodesFromProfile;
            // const profileDsNodes = dsNodesFromProfile.filter((d) => !storageNodes.find((s) => s.dsName));

            const updatedDsNodes = await fetchUserProfileForAllNames(
                profileDsNodes,
                dsNodeFromLocalStorage ? true : false,
            );

            // set nodes in the list to show on Network UI
            setNodes(updatedDsNodes);
            return;
        }

        setNodes([]);
    };

    const updateProfileForDm3AndAddressName = async () => {
        // extract array of delivery service nodes names
        const newNodes = nodes.map((n) => n.dsName);

        // add those nodes to new profile
        const newProfile = { ...account?.profile! };
        newProfile.deliveryServices = newNodes;

        // create new profile object
        const signedUserProfile = {
            profile: newProfile,
            signature: account?.profileSignature!,
        };

        let response: {
            addrName: {
                profile: UserProfile | null;
                isActive: boolean;
            };
            dm3Name: {
                profile: UserProfile | null;
                isActive: boolean;
            };
            opName: null;
            gnosisName: null;
            ensName: null;
        } = {
            addrName: {
                profile: null,
                isActive: false,
            },
            dm3Name: {
                profile: null,
                isActive: false,
            },
            opName: null,
            gnosisName: null,
            ensName: null,
        };

        // update profile for address name
        const addrSubdomain = dm3Configuration.addressEnsSubdomain.substring(1);
        response.addrName.isActive = await updateProfile(
            ethAddress as string,
            dm3Configuration.resolverBackendUrl,
            addrSubdomain,
            signedUserProfile,
        );
        response.addrName.profile = newProfile as UserProfile;

        const addressName = ethAddress?.concat(
            dm3Configuration.addressEnsSubdomain,
        );
        const dm3Name = await fetchExistingDM3Name(
            account as Account,
            mainnetProvider,
            dm3Configuration,
            addressName as string,
        );

        // if DM3 name is not set, no need to update the profile for DM3 name
        if (!dm3Name) {
            response.dm3Name.isActive = false;
        }

        if (dm3Name && dm3Name.endsWith(dm3Configuration.userEnsSubdomain)) {
            //removes the leading . from the subdomain.
            //This is necessary as the resolver does not support subdomains with leading dots
            const dm3NameSubdomain =
                dm3Configuration.userEnsSubdomain.substring(1);
            response.dm3Name.isActive = await updateProfile(
                ethAddress as string,
                dm3Configuration.resolverBackendUrl,
                dm3NameSubdomain,
                signedUserProfile,
            );
            response.dm3Name.profile = newProfile as UserProfile;
        }

        return response;
    };

    const updateProfileWithTransaction = async (
        existingName: string | null,
    ) => {
        // extract array of delivery service nodes names
        const newNodes = nodes.map((n) => n.dsName);

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
        const newNodes = nodes.map((n) => n.dsName);

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

        // check its OPTIMISM name
        if (profileName.endsWith('.op.dm3.eth')) {
            // start loader
            setLoaderContent('Updating profile...');
            startLoader();

            try {
                await registerOpName(provider, () => {}, profileName);

                // do transaction
                await publishProfile(provider, updatedAccount, profileName);

                updateNodeList('OPTIMISM', newProfile);
                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }

        // check its GNOSIS name
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

                updateNodeList('GNOSIS', newProfile);
                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }

        // check its ENS name
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

                updateNodeList('ENS', newProfile);
                setProfileName(null);
                closeLoader();
            } catch (error) {
                console.log('Failed to update profile : ', error);
                closeLoader();
            }
        }
    };

    const updateNodeList = (name: string, newProfile: UserProfile) => {
        // fetch DS nodes from local storage
        const dsNodeFromLocalStorage = getDsNodesFromLocalStorage();

        const profileObject = {
            profile: newProfile,
            isActive: true,
        };

        const updatedProperty =
            name === 'ENS'
                ? { ensName: profileObject }
                : name === 'GNOSIS'
                ? { gnosisName: profileObject }
                : { opName: profileObject };

        // update the DS nodes in local storage
        const updatedNodes = dsNodeFromLocalStorage
            ? dsNodeFromLocalStorage.map((d) => {
                  return {
                      ...d,
                      ...updatedProperty,
                  };
              })
            : [];

        setDsNodesInLocalStorage(updatedNodes);

        // update node list
        setNodes((prev) => {
            return prev.map((d) => {
                return {
                    ...d,
                    ...updatedProperty,
                };
            });
        });
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
        if (nodes.filter((data) => data.dsName === nodeName).length) {
            setError('ENS name already exists');
            return;
        }

        const namesResponse = await updateProfileForDm3AndAddressName();

        // fetch DS nodes from local storage
        const dsNodeFromLocalStorage = getDsNodesFromLocalStorage();

        // update the DS nodes in local storage
        const updatedNodes = dsNodeFromLocalStorage
            ? [
                  ...dsNodeFromLocalStorage,
                  { dsName: nodeName, ...namesResponse },
              ]
            : [{ dsName: nodeName, ...namesResponse }];

        setDsNodesInLocalStorage(updatedNodes);

        // update node list
        setNodes((prev) => {
            return [...prev, { dsName: nodeName, ...namesResponse }];
        });

        // clear the input field
        setNodeName('');
        // clear all errors
        setError(null);
        // close the input field window
        setIsModalOpenToAddNode(false);
    };

    // TODO: Call backend function
    const deleteNode = async (id: number) => {
        const updatedNodes = nodes.filter((d, i) => i !== id);
        setNodes(updatedNodes);
    };

    // TODO: Call backend function
    const changeOrder = async (index: number) => {
        setNodes((prevState) => {
            const data = [...prevState];
            const temp = data[index - 1];
            data[index - 1] = data[index];
            data[index] = temp;
            return data;
        });
    };

    const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setNodeName(e.target.value);
    };

    const changeNetwork = (chainId: number) => {
        if (chainId !== connectedChainId && switchNetwork) {
            switchNetwork(chainId);
        }
    };

    useEffect(() => {
        initialize();
    }, [account?.ensName]);

    return {
        initialize,
        addNode,
        updateProfileWithTransaction,
        deleteNode,
        changeOrder,
        nodes,
        isModalOpenToAddNode,
        setIsModalOpenToAddNode,
        error,
        setError,
        nodeName,
        setNodeName,
        handleNodeNameChange,
        updateProfileForDm3AndAddressName,
        isDm3NameConfigured,
        isEnsNameConfigured,
    };
};
