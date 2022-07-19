import React, { useContext } from 'react';
import './SignIn.css';
import * as Lib from 'dm3-lib';
import { connectionPhase } from './Phases';
import { GlobalContext } from '../GlobalContextProvider';

interface StoreTokenProps {
    storageLocation: Lib.StorageLocation;
    storeApiToken: boolean;
    setStoreApiToken: (store: boolean) => void;
}

function StoreToken(props: StoreTokenProps) {
    const { state } = useContext(GlobalContext);
    if (
        connectionPhase(state.connection.connectionState) ||
        props.storageLocation !== Lib.StorageLocation.Web3Storage
    ) {
        return null;
    }

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <div className="list-group">
                    <a
                        href="#"
                        className="list-group-item list-group-item-action"
                        onClick={() =>
                            props.setStoreApiToken(!props.storeApiToken)
                        }
                    >
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                            checked={props.storeApiToken}
                            readOnly
                        />
                        &nbsp;&nbsp; Store API Token
                    </a>
                </div>
            </div>{' '}
            <div className="col-md-7 help-text">
                Keep API token in browser storage
                <p className="explanation">
                    Unchecking this box will delete the token.
                </p>
            </div>
        </div>
    );
}

export default StoreToken;
