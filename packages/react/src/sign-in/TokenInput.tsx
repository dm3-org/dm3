import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from 'dm3-lib';
import { connectionPhase } from './Phases';
import { GlobalContext } from '../GlobalContextProvider';
import Icon from '../ui-shared/Icon';

interface TokenInputProps {
    storageLocation: Lib.StorageLocation;
    token: string | undefined;
    setToken: (token: string | undefined) => void;
    storeApiToken: boolean;
}

function TokenInput(props: TokenInputProps) {
    const { state, dispatch } = useContext(GlobalContext);
    if (
        connectionPhase(state.connection.connectionState) ||
        props.storageLocation !== Lib.StorageLocation.Web3Storage ||
        (state.uiState.proflieExists && props.token && props.storeApiToken)
    ) {
        return null;
    }

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <input
                    onInput={(e) => props.setToken((e.target as any).value)}
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="API Token"
                />
            </div>{' '}
            <div className="col-md-7 help-text">
                Enter Web3 Storage API token
                <p className="explanation">
                    The API token can be obtained by registering a{' '}
                    <a
                        href="https://web3.storage"
                        target="_blank"
                        className="text-decoration-none help-text explanation"
                    >
                        web3.storage account{' '}
                        <Icon iconClass="fas fa-external-link-alt fa-xm" />
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}

export default TokenInput;
