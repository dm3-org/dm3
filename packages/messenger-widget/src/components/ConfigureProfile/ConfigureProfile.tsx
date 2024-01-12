import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { useContext, useEffect, useState } from 'react';
import closeIcon from '../../assets/images/cross.svg';
import tickIcon from '../../assets/images/white-tick.svg';
import '../../styles/modal.css';
import { GlobalContext } from '../../utils/context-utils';
import DeleteDM3Name from '../DeleteDM3Name/DeleteDM3Name';
import './ConfigureProfile.css';
import {
    ACTION_TYPE,
    BUTTON_CLASS,
    NAME_TYPE,
    PROFILE_INPUT_FIELD_CLASS,
    closeConfigurationModal,
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
    ConfigureProfileContext,
    ConfigureProfileContextProvider,
} from './context/ConfigureProfileContext';
import { AuthContext } from '../../context/AuthContext';
import { useNetwork } from 'wagmi';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { switchNetwork } from '@wagmi/core';

export function ConfigureUserProfile() {
    // global context state
    const { state, dispatch } = useContext(GlobalContext);
    const { chain } = useNetwork();

    const { account, ethAddress, deliveryServiceToken, setAccount } =
        useContext(AuthContext);
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
        setAccount: Function,
    ) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = dm3Name.trim();
            if (!name.length) {
                onShowError(NAME_TYPE.DM3_NAME, 'DM3 name cannot be empty');
                return;
            }
            await submitDm3UsernameClaim(
                state,
                mainnetProvider,
                account!,
                deliveryServiceToken!,
                name,
                dispatch,
                setError,
                setAccount,
            );
        } else {
            const result = await removeAliasFromDm3Name(
                state,
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
        const chainId = fetchChainIdFromServiceName(serviceName);
        if (chainId && chainId !== chain?.id) {
            switchNetwork({ chainId });
        }
    };

    // handles existing ENS name
    useEffect(() => {
        if (
            account!.ensName &&
            !account!.ensName.endsWith(globalConfig.ADDR_ENS_SUBDOMAIN())
        ) {
            fetchExistingDM3Name(mainnetProvider, account!, setExistingDm3Name);
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
        if (chain) {
            setNamingServiceSelected(fetchServiceFromChainId(chain.id));
        }
    }, []);

    return (
        <div>
            <div
                id="configuration-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="configuration-modal-content border-radius-6 
background-container text-primary-color"
                >
                    {/* Delete DM3 name confirmation popup modal */}
                    {showDeleteConfirmation && (
                        <DeleteDM3Name
                            setDeleteDM3NameConfirmation={
                                updateDeleteConfirmation
                            }
                            removeDm3Name={handleClaimOrRemoveDm3Name}
                        />
                    )}

                    {/* Header */}
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                DM3 Profile Configuration
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Your dm3 profile needs to be published. You can
                                use your own ENS name, get a DM3 name, or keep
                                your wallet address.
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() =>
                                closeConfigurationModal(
                                    setDm3Name,
                                    setEnsName,
                                    () => { },
                                    (type: NAME_TYPE) => onShowError(type, ''),
                                    dispatch,
                                )
                            }
                        />
                    </div>

                    <hr className="line-separator separator text-secondary-color" />

                    <div>
                        {/* Wallet address */}
                        <div className="d-flex ps-4">
                            <div className="configuration-items-align">
                                {ethAddress && <img src={tickIcon} />}
                            </div>
                            <div className="profile-config-container">
                                <div className="d-flex">
                                    <p
                                        className="m-0 
                                        font-size-14 font-weight-500 line-height-24 title-content"
                                    >
                                        Wallet Address
                                    </p>
                                    <p
                                        className="m-0 
                                        font-size-14 font-weight-500 line-height-24 grey-text"
                                    >
                                        {ethAddress &&
                                            ethAddress +
                                            globalConfig.ADDR_ENS_SUBDOMAIN()}
                                    </p>
                                </div>
                                <div className="address-details">
                                    <div className="small-text font-weight-300 grey-text">
                                        You can use your wallet address as a
                                        username. A virtual profile is created
                                        and stored at a dm3 service. There are
                                        no transaction costs for creation and
                                        administration.
                                    </div>
                                    <div className="small-text font-weight-700">
                                        You can receive messages sent to your
                                        wallet address.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DM3 Name */}
                        <div className="mt-5">
                            <div className="d-flex ps-4 align-items-center">
                                <div className="configuration-items-align invisible">
                                    <img src={tickIcon} />
                                </div>
                                <p
                                    className="m-0 font-size-14 font-weight-500 line-height-24 
                                title-content invisible"
                                >
                                    DM3 Name
                                </p>

                                <div
                                    className={
                                        'conversation-error font-weight-400 ms-3 show-error'
                                    }
                                >
                                    {showError === NAME_TYPE.DM3_NAME &&
                                        errorMsg}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex ps-4 align-items-baseline">
                            <div className="configuration-items-align">
                                {existingDm3Name && <img src={tickIcon} />}
                            </div>
                            <div className="dm3-name-container">
                                <div className="d-flex align-items-center">
                                    <p
                                        className="m-0 
                                        font-size-14 font-weight-500 line-height-24 title-content"
                                    >
                                        DM3 Name
                                    </p>
                                    {!existingDm3Name ? (
                                        <form
                                            className="d-flex width-fill align-items-center"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleClaimOrRemoveDm3Name(
                                                    ACTION_TYPE.CONFIGURE,
                                                    setAccount,
                                                );
                                            }}
                                        >
                                            <input
                                                data-testid="dm3-name"
                                                className={PROFILE_INPUT_FIELD_CLASS.concat(
                                                    ' ',
                                                    showError ===
                                                        NAME_TYPE.DM3_NAME
                                                        ? 'err-background'
                                                        : '',
                                                )}
                                                type="text"
                                                value={dm3Name}
                                                placeholder="Enter your preferred name and check availability"
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    handleNameChange(
                                                        e,
                                                        NAME_TYPE.DM3_NAME,
                                                    )
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
                                                {/* COMMENTED AS IT DOESN'T WORK NOW, BUT NEEDED LATER */}
                                                {/* <img
                                            className="ms-4 pointer-cursor"
                                            src={deleteIcon}
                                            alt="remove"
                                            onClick={() =>
                                                setShowDeleteConfirmation(
                                                    true,
                                                )
                                            }
                                        /> */}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="mt-3 dm3-name-content">
                                    <div className="small-text font-weight-300 grey-text">
                                        You can get a DM3 name for free. Please
                                        check if your desired name is available.
                                        DM3 names are created and managed on
                                        Layer2 (e.g. Optimism). Small
                                        transaction costs will apply for setting
                                        the profile and administration.
                                    </div>
                                    <div className="small-text font-weight-700">
                                        You can receive messages sent to your
                                        full DM3 username.
                                    </div>
                                </div>
                            </div>
                            <div>
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
                                                setAccount,
                                            )
                                        }
                                    >
                                        Claim & Publish
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 d-flex ps-4 align-items-baseline">
                            <div className="configuration-items-align"></div>
                            <div>
                                <select
                                    className="name-service-selector"
                                    value={namingServiceSelected}
                                    onChange={(e) => {
                                        setNamingServiceSelected(
                                            e.target.value,
                                        );
                                        changeNetwork(e.target.value);
                                    }}
                                >
                                    {namingServices &&
                                        namingServices.map((data, index) => {
                                            return (
                                                <option
                                                    value={data.name}
                                                    key={index}
                                                >
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        </div>

                        {fetchComponent(namingServiceSelected)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ConfigureProfile() {
    return (
        <ConfigureProfileContextProvider>
            <ConfigureUserProfile />
        </ConfigureProfileContextProvider>
    );
}
