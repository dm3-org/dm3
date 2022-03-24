import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from '../lib';
import { connectionPhase } from './Phases';
import { GlobalContext } from '../GlobalContextProvider';

interface TokenInputProps {
    storageLocation: Lib.StorageLocation;
    existingAccount: boolean;
    token: string | undefined;
    setToken: (token: string | undefined) => void;
    storeApiToken: boolean;
}

function TokenInput(props: TokenInputProps) {
    const { state } = useContext(GlobalContext);
    if (
        connectionPhase(state.connection.connectionState) ||
        props.storageLocation !== Lib.StorageLocation.Web3Storage ||
        (props.existingAccount && props.token && props.storeApiToken)
    ) {
        return null;
    }

    return (
        <div className="row row-space">
            <div className="col-md-4">
                <input
                    onInput={(e) => props.setToken((e.target as any).value)}
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="API Token"
                />
            </div>{' '}
            <div className="col-md-8 help-text">
                Enter Web3 Storage API token
            </div>
        </div>
    );
}

export default TokenInput;
