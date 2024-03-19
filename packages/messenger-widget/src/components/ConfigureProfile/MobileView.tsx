import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { switchNetwork } from '@wagmi/core';
import { useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import '../../styles/modal.css';
import { GlobalContext } from '../../utils/context-utils';
import DeleteDM3Name from '../DeleteDM3Name/DeleteDM3Name';
import './ConfigureProfile.css';
import {
    fetchChainIdFromServiceName,
    fetchComponent,
    fetchExistingDM3Name,
    fetchServiceFromChainId,
    getEnsName,
    namingServices,
    removeAliasFromDm3Name,
    submitDm3UsernameClaim,
    validateName,
} from './bl';
import {
    ACTION_TYPE,
    BUTTON_CLASS,
    NAME_TYPE,
    PROFILE_INPUT_FIELD_CLASS,
} from './chain/common';
import { ConfigureProfileContext } from './context/ConfigureProfileContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function MobileView() {
    // global context state
    const { dispatch } = useContext(GlobalContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const connectedChainId = useChainId();

    const {
        account,
        ethAddress,
        deliveryServiceToken,
        setDisplayName,
        profileKeys,
    } = useContext(AuthContext);
    const mainnetProvider = useMainnetProvider();

    // existing profile details states
    const [existingDm3Name, setExistingDm3Name] = useState<string | null>(null);

    // input field states
    const [dm3Name, setDm3Name] = useState<string>('');

    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);

    const [namingServiceSelected, setNamingServiceSelected] = useState<string>(
        namingServices[0].name,
    );

    const { setEnsName, showError, ensName, onShowError, errorMsg } =
        useContext(ConfigureProfileContext);

    const updateDeleteConfirmation = (action: boolean) => {
        setShowDeleteConfirmation(action);
    };

    const setError = (error: string, type: NAME_TYPE | undefined) => {
        onShowError(type, error);
    };

    // handles name change event
    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: NAME_TYPE,
    ) => {
        onShowError(undefined, '');
        const check = validateName(e.target.value);
        setDm3Name(e.target.value);
        setEnsName('');
        !check && setError('Invalid name', NAME_TYPE.DM3_NAME);
    };

    // handles claim or delete DM3 user name
    const handleClaimOrRemoveDm3Name = async (
        type: ACTION_TYPE,
        setDisplayName: Function,
    ) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = dm3Name.trim();
            if (!name.length) {
                onShowError(NAME_TYPE.DM3_NAME, 'DM3 name cannot be empty');
                return;
            }
            await submitDm3UsernameClaim(
                dm3Configuration.resolverBackendUrl,
                profileKeys!,
                mainnetProvider,
                account!,
                deliveryServiceToken!,
                name,
                dispatch,
                setError,
                setDisplayName,
                setExistingDm3Name,
            );
        } else {
            const result = await removeAliasFromDm3Name(
                dm3Configuration.resolverBackendUrl,
                profileKeys!,
                account!,
                ethAddress!,
                existingDm3Name as string,
                dispatch,
                setError,
            );
            result && setExistingDm3Name(null);
        }
    };

    // changes network on naming service change
    const changeNetwork = (serviceName: string) => {
        const chainId = fetchChainIdFromServiceName(
            serviceName,
            dm3Configuration.chainId,
        );
        if (chainId && chainId !== connectedChainId) {
            switchNetwork({ chainId });
        }
    };

    // handles existing ENS name
    useEffect(() => {
        if (account!.ensName) {
            fetchExistingDM3Name(
                dm3Configuration.resolverBackendUrl,
                mainnetProvider,
                account!,
                setExistingDm3Name,
            );
        }
    }, [account]);

    // clears the input field on deleting the alias
    useEffect(() => {
        if (!showDeleteConfirmation) {
            setDm3Name('');
        }
    }, [showDeleteConfirmation]);

    // handles ENS name and address
    useEffect(() => {
        getEnsName(mainnetProvider, ethAddress!, account!, (name: string) =>
            setEnsName(name),
        );
    }, [ethAddress]);

    useEffect(() => {
        if (connectedChainId) {
            setNamingServiceSelected(fetchServiceFromChainId(connectedChainId));
        }
    }, []);

    return (
        <div>
            {/* DM3 Name */}
            <div className="d-flex ps-2 align-items-baseline">
                <div className="dm3-name-container">
                    <div className="d-flex flex-column">
                        <p
                            className="m-0 
                    font-size-14 font-weight-500 line-height-24 title-content"
                        >
                            DM3 Name
                        </p>
                        <div
                            className={
                                'conversation-error font-weight-400 ms-3 show-error'
                            }
                        >
                            {showError === NAME_TYPE.DM3_NAME && errorMsg}
                        </div>
                        {!existingDm3Name ? (
                            <form
                                className="pe-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleClaimOrRemoveDm3Name(
                                        ACTION_TYPE.CONFIGURE,
                                        setDisplayName,
                                    );
                                }}
                            >
                                <input
                                    data-testid="dm3-name"
                                    className={PROFILE_INPUT_FIELD_CLASS.concat(
                                        ' ',
                                        showError === NAME_TYPE.DM3_NAME
                                            ? 'err-background'
                                            : '',
                                    )}
                                    type="text"
                                    value={dm3Name}
                                    placeholder="Enter your preferred name & check availability"
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        handleNameChange(e, NAME_TYPE.DM3_NAME)
                                    }
                                />
                                <p
                                    className="mb-0 ms-1 font-size-14 font-weight-500 
                line-height-24 grey-text"
                                >
                                    {globalConfig.USER_ENS_SUBDOMAIN()}
                                </p>
                            </form>
                        ) : (
                            <>
                                <p
                                    className="m-0 font-size-14 font-weight-500 line-height-24 
                grey-text d-flex align-items-center"
                                >
                                    {existingDm3Name}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="mt-2">
                        {!existingDm3Name && (
                            <button
                                data-testid="claim-publish"
                                disabled={!dm3Name || !dm3Name.length}
                                className={BUTTON_CLASS.concat(
                                    ' ',
                                    !dm3Name || !dm3Name.length
                                        ? 'modal-btn-disabled'
                                        : 'modal-btn-active',
                                )}
                                onClick={() =>
                                    handleClaimOrRemoveDm3Name(
                                        ACTION_TYPE.CONFIGURE,
                                        setDisplayName,
                                    )
                                }
                            >
                                Claim & Publish
                            </button>
                        )}
                    </div>
                    <div className="mt-3 dm3-name-content">
                        <div className="small-text font-weight-300 grey-text">
                            You can get a DM3 name for free. Please check if
                            your desired name is available. DM3 names are
                            created and managed on Layer2 (e.g. Optimism). Small
                            transaction costs will apply for setting the profile
                            and administration.
                        </div>
                        <div className="small-text font-weight-700">
                            You can receive messages sent to your full DM3
                            username.
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 d-flex ps-2 align-items-baseline">
                <div className="configuration-items-align"></div>
                <div>
                    <select
                        className="name-service-selector"
                        value={namingServiceSelected}
                        onChange={(e) => {
                            setNamingServiceSelected(e.target.value);
                            changeNetwork(e.target.value);
                        }}
                    >
                        {namingServices &&
                            namingServices.map((data, index) => {
                                return (
                                    <option value={data.name} key={index}>
                                        {data.name.split('- ')[1]}
                                    </option>
                                );
                            })}
                    </select>
                </div>
            </div>

            {fetchComponent(namingServiceSelected, dm3Configuration.chainId)}
        </div>
    );
}
