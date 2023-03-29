import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';
import { ConnectionType } from '../reducers/Connection';
import { ethers } from 'ethers';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import Icon from '../ui-shared/Icon';
import { getPublishProfileOnchainTransaction } from './getPublishProfileOnchainTransaction';

function ConfigView() {
    const [addrEnsName, setAddrEnsName] = useState<string | undefined>();
    const [dm3UserEnsName, setDm3UserEnsName] = useState<string | undefined>();
    const [existingDm3UserEnsName, setExistingDm3UserEnsName] = useState<
        string | undefined
    >();

    const [loadingTopicName, setLoadingTopicName] = useState<
        'dm3UserName' | 'ensName' | undefined
    >();

    const [error, setError] = useState<string | undefined>();

    type SelectedHelpType = 'addr' | 'dm3user' | 'ensName' | undefined;

    const [selectedHelpText, setSelectedHelpText] =
        useState<SelectedHelpType>();

    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        if (
            state.connection.account?.ensName &&
            state.connection.account?.ensName.endsWith(
                Lib.GlobalConf.USER_ENS_SUBDOMAIN(),
            )
        ) {
            setExistingDm3UserEnsName(state.connection.account.ensName);
        }
    }, [state.connection.account?.ensName]);

    const getAddrEnsName = async () => {
        if (state.connection.ethAddress && state.connection.provider) {
            const address = await state.connection.provider.resolveName(
                state.connection.ethAddress +
                    Lib.GlobalConf.ADDR_ENS_SUBDOMAIN(),
            );

            if (
                address &&
                Lib.account.formatAddress(address) ===
                    Lib.account.formatAddress(state.connection.ethAddress)
            ) {
                setAddrEnsName(
                    state.connection.ethAddress +
                        Lib.GlobalConf.ADDR_ENS_SUBDOMAIN(),
                );
            }
        }
    };

    //Related to the ENS name input field
    const [ensName, setEnsName] = useState<string | null>();
    const [isValidEnsName, setIsValidEnsName] = useState<boolean>(true);
    const [publishButtonState, setPublishButtonState] = useState<ButtonState>(
        ButtonState.Idel,
    );
    const getEnsName = async () => {
        if (state.connection.ethAddress && state.connection.provider) {
            const name = await state.connection.provider.lookupAddress(
                state.connection.ethAddress,
            );
            setEnsName(name);
        }
    };

    const handleInputEnsName = async (
        event: React.FormEvent<HTMLInputElement>,
    ) => {
        const ensName = (event.target as any).value;
        setEnsName(ensName);
        const isValidEnsName = ethers.utils.isValidName(ensName);
        if (!isValidEnsName) {
            setIsValidEnsName(false);
            return;
        }
        const address = await Lib.shared.ethersHelper.resolveOwner(
            state.connection.provider!,
            ensName,
        );

        if (address === null) {
            setIsValidEnsName(false);
            return;
        }

        if (
            Lib.shared.ethersHelper.formatAddress(address) !==
            Lib.shared.ethersHelper.formatAddress(state.connection.ethAddress!)
        ) {
            setIsValidEnsName(false);
            Lib.log("Ens name doesn't match the address");
            return;
        }

        setIsValidEnsName(true);
    };

    const submitDm3UsernameClaim = async () => {
        setLoadingTopicName('dm3UserName');
        setError(undefined);
        try {
            const signedProfile = await Lib.account.getUserProfile(
                state.connection,
                state.connection.account!.ensName,
            );

            await Lib.offchainResolverApi.claimSubdomain(
                state.connection.account!,
                process.env.REACT_APP_RESOLVER_BACKEND as string,
                dm3UserEnsName! + Lib.GlobalConf.USER_ENS_SUBDOMAIN(),
                signedProfile!,
            );

            await Lib.deliveryApi.createAlias(
                state.connection.account!,
                state.connection.provider!,
                state.connection.account!.ensName,
                dm3UserEnsName! + Lib.GlobalConf.USER_ENS_SUBDOMAIN(),
                state.auth.currentSession!.token!,
            );

            dispatch({
                type: ConnectionType.ChangeAccount,
                payload: {
                    ...state.connection.account!,
                    ensName:
                        dm3UserEnsName + Lib.GlobalConf.USER_ENS_SUBDOMAIN(),
                },
            });
            window.location.reload();
        } catch (e) {
            setLoadingTopicName(undefined);
            setError((e as Error).message);
        }
    };

    const submitProfileToMainnet = async () => {
        const tx = await getPublishProfileOnchainTransaction(
            state.connection,
            ensName!,
        );
        if (tx) {
            setPublishButtonState(ButtonState.Loading);

            await Lib.deliveryApi.createAlias(
                state.connection.account!,
                state.connection.provider!,
                state.connection.account!.ensName,
                ensName!,
                state.auth.currentSession!.token!,
            );
            const response = await Lib.shared.ethersHelper.executeTransaction(
                tx,
            );
            await response.wait();

            //Create alias
            setPublishButtonState(ButtonState.Success);
        } else {
            setPublishButtonState(ButtonState.Failed);
            throw Error('Error creating publish transaction');
        }
    };

    const getSubmitProfileButtonState = (): ButtonState => {
        if (!isValidEnsName) {
            return ButtonState.Disabled;
        }
        return publishButtonState;
    };

    const getSubmitUserNameButtonState = (): ButtonState => {
        if (loadingTopicName === 'dm3UserName') {
            return ButtonState.Loading;
        }
        if (!loadingTopicName && error) {
            return ButtonState.Idel;
        }
        if (loadingTopicName) {
            return ButtonState.Disabled;
        }
        return ButtonState.Idel;
    };

    useEffect(() => {
        getEnsName();
        getAddrEnsName();
    }, [state.connection.ethAddress, state.connection.provider]);

    const clickOnHelp = (id: SelectedHelpType) => {
        setSelectedHelpText(id === selectedHelpText ? undefined : id);
    };

    const getHelpIcon = (id: SelectedHelpType) => (
        <span onClick={() => clickOnHelp(id)} style={{ cursor: 'pointer' }}>
            <Icon iconClass="far fa-question-circle config-text" />
        </span>
    );
    return (
        <div className="user-info">
            <div className="row mb-3">
                <div className="col">
                    <p className="explain-text pb-4 ps-2 pe-2">
                        You can use your wallet address as a username. A virtual
                        profile is created and stored at a dm3 service. There
                        are no transaction costs for creation and
                        administration. You can receive messages sent to your
                        wallet address.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <div className="row mt-4">
                <div className="col">
                    <h5 className="user-info-text-highlight">
                        Wallet Address {getHelpIcon('addr')}
                    </h5>
                </div>
            </div>
            {selectedHelpText === 'addr' && (
                <div className="row">
                    <div className="col pe-4">
                        <p className="explain-text-sm pe-4">
                            You can use your wallet address as a username. A
                            virtual profile is created and stored at a dm3
                            service. There are no transaction costs for creation
                            and administration.
                            <p className="mt-2">
                                <strong>
                                    You can receive messages sent to your wallet
                                    address.
                                </strong>
                            </p>
                        </p>
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col">
                    <div className="input-group mb-3 value-text">
                        {addrEnsName}
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <h5 className="user-info-text-highlight">
                        dm3 User Name {getHelpIcon('dm3user')}
                    </h5>
                </div>
            </div>
            {selectedHelpText === 'dm3user' && (
                <div className="row">
                    <div className="col pe-4">
                        <p className="explain-text-sm pe-4">
                            You can get a DM3 name for free. Please check if
                            your desired name is available. DM3 names are
                            created and managed on Optimism. Small transaction
                            costs will apply for setting the profile and
                            administration.
                            <p className="mt-2">
                                <strong>
                                    You can receive messages sent to your full
                                    DM3 username.
                                </strong>
                            </p>
                        </p>
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col">
                    {!existingDm3UserEnsName ? (
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                onInput={(
                                    event: React.FormEvent<HTMLInputElement>,
                                ) => {
                                    setDm3UserEnsName(
                                        (event.target as any).value,
                                    );
                                }}
                                className={`form-control`}
                                placeholder="dm3 User Name"
                                aria-label="Text input with checkbox"
                                readOnly={!!existingDm3UserEnsName}
                            />
                            <span className="input-group-text">
                                {Lib.GlobalConf.USER_ENS_SUBDOMAIN()}
                            </span>
                            )
                        </div>
                    ) : (
                        <div className="value-text">
                            {existingDm3UserEnsName}
                        </div>
                    )}
                </div>
            </div>
            <div className="row mb-3">
                <div className="col d-flex justify-content-end">
                    {!existingDm3UserEnsName && (
                        <StateButton
                            btnState={getSubmitUserNameButtonState()}
                            btnType="secondary"
                            onClick={submitDm3UsernameClaim}
                            content={<>Claim & Reload</>}
                            className="submit-btn"
                            disabled={
                                !(dm3UserEnsName && dm3UserEnsName?.length > 3)
                            }
                        />
                    )}
                </div>
            </div>

            <div className="row  mt-4">
                <div className="col">
                    <h5 className="user-info-text-highlight">
                        ENS Name {getHelpIcon('ensName')}
                    </h5>
                </div>
            </div>
            {selectedHelpText === 'ensName' && (
                <div className="row">
                    <div className="col pe-4">
                        <p className="explain-text-sm pe-4">
                            To publish your dm3 profile, a transaction is sent
                            to set a text record in your ENS name. Transaction
                            costs will apply for setting the profile and
                            administration.
                            <p className="mt-2">
                                <strong>
                                    You can receive dm3 messages directly sent
                                    to your ENS name.
                                </strong>
                            </p>
                        </p>
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col">
                    {ensName ? (
                        <div className="value-text">{ensName}</div>
                    ) : (
                        <div className="input-group mb-3">
                            <input
                                value={ensName ?? ''}
                                onInput={handleInputEnsName}
                                type="text"
                                placeholder="ENS domain"
                                className={
                                    isValidEnsName
                                        ? 'form-control'
                                        : 'form-control border border-danger'
                                }
                                aria-label="Text input with checkbox"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="row mb-3">
                <div className="col d-flex justify-content-end">
                    <StateButton
                        btnState={getSubmitProfileButtonState()}
                        btnType="secondary"
                        onClick={submitProfileToMainnet}
                        content={<>Publish Profile</>}
                        className="submit-btn"
                    />
                </div>
            </div>
        </div>
    );
}

export default ConfigView;
