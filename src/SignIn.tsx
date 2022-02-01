import React, { useEffect } from 'react';
import './App.css';
import { connectAccount, ConnecteionState, signIn } from './lib/Web3Provider';
import { ethers } from 'ethers';
import Icon from './Icon';
import { log } from './lib/log';
import {
    prersonalSign,
    requestAccounts,
} from './external-apis/InjectedWeb3API';
import {
    requestChallenge,
    submitSignedChallenge,
} from './external-apis/BackendAPI';

interface SignInProps {
    web3Provider: ethers.providers.JsonRpcProvider;
    connectionState: ConnecteionState;
    changeConnectionState: (connecteionState: ConnecteionState) => void;
    setAccount: (account: string) => void;
    account: string;
    setSessionToken: (token: string) => void;
}

export function showSignIn(connectionState: ConnecteionState): boolean {
    return (
        connectionState === ConnecteionState.AccountConntectReady ||
        connectionState === ConnecteionState.SignInReady ||
        connectionState === ConnecteionState.WaitingForAccountConntection ||
        connectionState === ConnecteionState.WaitingForSignIn
    );
}

function SignIn(props: SignInProps) {
    const connect = async () => {
        props.changeConnectionState(
            ConnecteionState.WaitingForAccountConntection,
        );
        const accountConnection = await connectAccount(
            props.web3Provider,
            requestAccounts,
        );
        props.changeConnectionState(accountConnection.connectionState);
        if (accountConnection.account) {
            props.setAccount(accountConnection.account);
        }
    };

    const requestSignIn = async () => {
        props.changeConnectionState(ConnecteionState.WaitingForSignIn);

        const singInRequest = await signIn(
            props.web3Provider,
            props.account,
            requestChallenge,
            prersonalSign,
            submitSignedChallenge,
        );
        props.changeConnectionState(singInRequest.connectionState);
        if (singInRequest.sessionToken) {
            log(`Setting session token: ${singInRequest.sessionToken}`);
        }
    };

    return (
        <div className="row">
            <div className="col-md-6">
                <button
                    onClick={connect}
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                    disabled={
                        props.connectionState !==
                        ConnecteionState.AccountConntectReady
                    }
                >
                    1. Connect Account
                    {props.connectionState ===
                        ConnecteionState.WaitingForAccountConntection && (
                        <>
                            {' '}
                            <Icon iconClass="fas fa-spinner fa-spin" />
                        </>
                    )}
                </button>
            </div>
            <div className="col-md-6">
                <button
                    onClick={requestSignIn}
                    type="button"
                    className="btn btn-primary btn-lg w-100"
                    disabled={
                        props.connectionState !== ConnecteionState.SignInReady
                    }
                >
                    2. Sign In
                    {props.connectionState ===
                        ConnecteionState.WaitingForSignIn && (
                        <>
                            {' '}
                            <Icon iconClass="fas fa-spinner fa-spin" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default SignIn;
