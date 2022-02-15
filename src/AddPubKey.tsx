import React, { useEffect, useState } from 'react';
import './App.css';

import Icon from './Icon';
import { ApiConnection, ConnectionState } from './lib/Web3Provider';

interface AddPubKeyProps {
    changeApiConnection: (newApiConnection: Partial<ApiConnection>) => void;
}

function AddPubKey(props: AddPubKeyProps) {
    return (
        <div className="row add-pub-key text-center">
            <div className="col-12">
                <strong>Allow others to send you encrypted messages</strong>
                <br />
                <Icon iconClass="fas fa-arrow-down" />
                <br />
                <button
                    className={`btn btn-primary btn-lg`}
                    type="button"
                    onClick={() =>
                        props.changeApiConnection({
                            connectionState: ConnectionState.KeyCreation,
                        })
                    }
                >
                    Create Public Key
                </button>
            </div>
        </div>
    );
}

export default AddPubKey;
