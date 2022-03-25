import React, { useContext, useEffect, useState } from 'react';
import './UserInfo.css';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from '../lib';
import Icon from '../ui-shared/Icon';

import Avatar from '../ui-shared/Avatar';
import { AccountInfo } from '../reducers/shared';

interface UserInfoProps {
    account: Lib.Account;
}

interface EnsTextRecords {
    email?: string;
    url?: string;
    twitter?: string;
    github?: string;
}

function UserInfo(props: UserInfoProps) {
    const { state, dispatch } = useContext(GlobalContext);

    const [ensTextRecords, setEnsTextRecords] = useState<
        EnsTextRecords | undefined
    >();

    const ensName = state.ensNames.get(props.account.address);

    const getTextRecords = async () => {
        if (ensName) {
            const resolver = await state.connection.provider!.getResolver(
                ensName!,
            );
            if (resolver) {
                setEnsTextRecords({
                    email: await resolver.getText('email'),
                    url: await resolver.getText('url'),
                    twitter: await resolver.getText('com.twitter'),
                    github: await resolver.getText('com.github'),
                });
            }
        } else {
            setEnsTextRecords(undefined);
        }
    };

    useEffect(() => {
        if (
            state.accounts.accountInfoView === AccountInfo.Account ||
            state.accounts.accountInfoView === AccountInfo.Contact
        ) {
            getTextRecords();
        } else {
            setEnsTextRecords(undefined);
        }
    }, [
        state.accounts.selectedContact,
        state.connection.account,
        state.accounts.accountInfoView,
    ]);

    return (
        <div className="user-info">
            <div className="row row-space-sm">
                <div className="col text-center">
                    <Avatar contact={props.account} large={true} />
                </div>
            </div>
            <div className="row row-space-sm">
                <div className="col text-center account-name">
                    {Lib.getAccountDisplayName(
                        props.account.address,
                        state.ensNames,
                    )}
                </div>
            </div>
            {/* <div className="row row-space-xs">
                <div className="col text-center address-info">
                    {props.account.address}
                </div>
            </div> */}

            <div className="row row-space d-flex justify-content-center ens-records">
                <div className="col-8">
                    <div className="row ">
                        <div className="col-1 text-center">
                            <Icon iconClass="fab fa-ethereum" />
                        </div>
                        <div className="col-11 text-muted">
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
                    {ensTextRecords?.email && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="far fa-envelope" />
                            </div>
                            <div className="col-11 text-muted">
                                <a
                                    className="text-decoration-none text-muted"
                                    href={'mailto://' + ensTextRecords?.email}
                                    target="_blank"
                                >
                                    {ensTextRecords?.email}
                                </a>
                            </div>
                        </div>
                    )}
                    {ensTextRecords?.url && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="fas fa-link" />
                            </div>
                            <div className="col-11 text-muted">
                                <a
                                    className="text-decoration-none text-muted"
                                    href={ensTextRecords?.url}
                                    target="_blank"
                                >
                                    {ensTextRecords?.url}
                                </a>
                            </div>
                        </div>
                    )}
                    {ensTextRecords?.github && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="fab fa-github" />
                            </div>
                            <div className="col-11 text-muted">
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
                    )}
                    {ensTextRecords?.twitter && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="fab fa-twitter" />
                            </div>
                            <div className="col-11 text-muted">
                                <a
                                    className="text-decoration-none text-muted"
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
                    )}
                    {props.account.publicKeys?.publicSigningKey && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="fas fa-signature" />
                            </div>
                            <div className="col-11 text-muted">
                                {props.account.publicKeys?.publicSigningKey}
                            </div>
                        </div>
                    )}
                    {props.account.publicKeys?.publicMessagingKey && (
                        <div className="row ">
                            <div className="col-1  text-center">
                                <Icon iconClass="fas fa-lock" />
                            </div>
                            <div className="col-11 text-muted">
                                {props.account.publicKeys?.publicMessagingKey}
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
                                    className={`w-100 btn btn-lg btn-outline-secondary`}
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
                                <button
                                    type="button"
                                    className={`w-100 btn btn-lg btn-primary`}
                                >
                                    Publish Public Keys
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserInfo;
