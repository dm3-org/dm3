import React, { useContext, useEffect, useState } from 'react';
import './UserInfo.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';
import Icon from '../ui-shared/Icon';

import Avatar, { SpecialSize } from '../ui-shared/Avatar';
import { AccountInfo } from '../reducers/shared';
import { useAsync } from '../ui-shared/useAsync';
import StateButton, { ButtonState } from '../ui-shared/StateButton';

interface UserInfoProps {
    account: Lib.account.Account;
}

interface EnsTextRecords {
    email?: string;
    url?: string;
    twitter?: string;
    github?: string;
}

function UserInfo(props: UserInfoProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const [publishButtonState, setPublishButtonState] = useState<ButtonState>(
        ButtonState.Idel,
    );

    const [ensTextRecords, setEnsTextRecords] = useState<
        EnsTextRecords | undefined
    >();

    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');
    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (state?.connection?.account?.profile === undefined) {
                return;
            }
            const { url } = await Lib.delivery.getDeliveryServiceProfile(
                state.connection.account.profile,
            );
            setdeliveryServiceUrl(url);
        };

        getDeliveryServiceUrl();
    }, [state.connection.account?.profile]);

    const ensName = state.cache.ensNames.get(props.account.address);

    const getTextRecords = async (): Promise<EnsTextRecords | undefined> => {
        if (
            (state.accounts.accountInfoView === AccountInfo.Account ||
                state.accounts.accountInfoView === AccountInfo.Contact) &&
            ensName &&
            state.connection.provider
        ) {
            return Lib.external.getDefaultEnsTextRecord(
                state.connection.provider,
                ensName,
            );
        } else {
            return;
        }
    };

    useAsync(
        getTextRecords,
        (data: unknown) => {
            setEnsTextRecords(data as EnsTextRecords | undefined);
        },
        [
            state.accounts.selectedContact,
            state.connection.account,
            state.accounts.accountInfoView,
        ],
    );

    const publishProfileOnchain = async () => {
        setPublishButtonState(ButtonState.Loading);
        try {
            const tx = await Lib.account.publishProfileOnchain(
                state.connection,
                state.connection.defaultServiceUrl +
                    '/profile/' +
                    state.connection.account!.address,
            );

            if (tx) {
                const response = await Lib.external.executeTransaction(tx);
                await response.wait();
                setPublishButtonState(ButtonState.Success);
            } else {
                throw Error('Error creating publish transaction');
            }
        } catch (e) {
            Lib.log(e as string);
            setPublishButtonState(ButtonState.Failed);
        }
    };

    return (
        <div className="user-info">
            <div className="row row-space-sm">
                <div className="col text-center">
                    <Avatar
                        accountAddress={props.account.address}
                        specialSize={SpecialSize.Md}
                    />
                </div>
            </div>

            <div className="row mt-4 user-info-row ">
                <div className="col-2 text-center">
                    <button
                        type="button"
                        className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                        disabled
                    >
                        <Icon iconClass="fab fa-ethereum" />
                    </button>
                </div>
                <div className="col-10 text-muted info-value d-flex">
                    <div className="align-self-center">
                        <a
                            className="text-decoration-none text-muted"
                            href={
                                'https://etherscan.io/address/' +
                                props.account.address
                            }
                            target="_blank"
                        >
                            {props.account.address}
                        </a>
                    </div>
                </div>
            </div>
            {ensTextRecords?.email && (
                <div className="row user-info-row ">
                    <div className="col-2  text-center">
                        <button
                            type="button"
                            className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="far fa-envelope" />
                        </button>
                    </div>
                    <div className="col-10 text-muted info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none text-muted"
                                href={'mailto://' + ensTextRecords?.email}
                                target="_blank"
                            >
                                {ensTextRecords?.email}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.url && (
                <div className="row  user-info-row">
                    <div className="col-2  text-center">
                        <button
                            type="button"
                            className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fas fa-link" />
                        </button>
                    </div>
                    <div className="col-10 text-muted info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none text-muted"
                                href={ensTextRecords?.url}
                                target="_blank"
                            >
                                {ensTextRecords?.url}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.github && (
                <div className="row user-info-row">
                    <div className="col-2  text-center">
                        <button
                            type="button"
                            className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fab fa-github" />
                        </button>
                    </div>
                    <div className="col-10 text-muted info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none text-muted"
                                href={
                                    'https://github.com/' +
                                    ensTextRecords?.github
                                }
                                target="_blank"
                            >
                                @{ensTextRecords?.github}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensTextRecords?.twitter && (
                <div className="row user-info-row">
                    <div className="col-2  text-center">
                        <button
                            type="button"
                            className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fab fa-twitter" />
                        </button>
                    </div>
                    <div className="col-10 text-muted info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none text-muted align-self-center"
                                href={
                                    'https://twitter.com/' +
                                    ensTextRecords?.twitter
                                }
                                target="_blank"
                            >
                                @{ensTextRecords?.twitter}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {props.account.profile && (
                <div className="row user-info-row">
                    <div className="col-2  text-center">
                        <button
                            type="button"
                            className="right-btn btn btn-outline-secondary w-100 show-add-btn align-self-center"
                            disabled
                        >
                            <Icon iconClass="fas fa-lock" />
                        </button>
                    </div>
                    <div className="col-10 text-muted info-value d-flex">
                        <div className="align-self-center">
                            <a
                                className="text-decoration-none text-muted align-self-center"
                                href={
                                    deliveryServiceUrl +
                                    '/profile/' +
                                    props.account.address
                                }
                                target="_blank"
                            >
                                {deliveryServiceUrl +
                                    '/profile/' +
                                    props.account.address}
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {ensName && (
                <div className="row row-space">
                    <div className="col-12 text-muted">
                        <a
                            href={`https://app.ens.domains/name/${ensName}/details`}
                            target="_blank"
                            type="button"
                            className={`w-100 btn btn-lg btn-outline-secondary right-state-button`}
                        >
                            {state.accounts.accountInfoView ===
                            AccountInfo.Account
                                ? 'Edit'
                                : 'Show'}{' '}
                            ENS Info
                        </a>
                    </div>
                </div>
            )}
            {state.accounts.accountInfoView === AccountInfo.Account && (
                <div className="row row-space ">
                    <div className="col-12 text-muted">
                        <StateButton
                            btnState={publishButtonState}
                            btnType="primary"
                            onClick={publishProfileOnchain}
                            content={<>Publish Profile</>}
                            className="right-state-button"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserInfo;
