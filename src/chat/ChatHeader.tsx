import React, { useContext, useEffect, useState } from 'react';
import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';
import { GlobalContext } from '../GlobalContextProvider';
import Avatar from '../ui-shared/Avatar';

interface ChatHeaderProps {
    account: Lib.Account;
}

function ChatHeader(props: ChatHeaderProps) {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div className="account-name w-100 d-flex justify-content-between">
            <div>
                <Avatar contact={props.account} />
            </div>
            <div>
                {Lib.getAccountDisplayName(
                    props.account.address,
                    state.ensNames,
                )}
            </div>
            {props.account.publicKeys?.publicMessagingKey ? (
                <div className="push-end header-lock text-success">
                    <Icon iconClass="fas fa-user-check align-bottom" />
                </div>
            ) : (
                <div
                    className=" push-end header-lock header-lock text-warning"
                    title="Waiting for user to register public keys"
                >
                    <Icon iconClass="fas fa-user-clock align-bottom" />
                </div>
            )}
        </div>
    );
}

export default ChatHeader;
