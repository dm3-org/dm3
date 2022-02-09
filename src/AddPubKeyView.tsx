import { useState } from 'react';
import AddPubKey from './AddPubKey';

import { getEncryptionPublicKey } from './external-apis/InjectedWeb3API';

import { submitPublicKey as submitPublicKeyApi } from './external-apis/BackendAPI';
import Icon from './Icon';
import {
    ApiConnection,
    createEncryptionPublicKey,
    submitPublicKey,
} from './lib/Web3Provider';

interface AddPubKeyViewProps {
    apiConnection: ApiConnection;
    setEncryptionPublicKey: (pubKey: string) => void;
    switchToSignedIn: () => void;
}

export enum PubKeyState {
    Unknown,
    NoKey,
    WaitingForKeyCreation,
    KeyCreationFailed,
    KeyCreated,
    WaitingForPublication,
    PublicationFailed,
    KeyPublished,
}

function AddPubKeyView(props: AddPubKeyViewProps) {
    const [pubKeyState, setPubKeyState] = useState<PubKeyState>(
        PubKeyState.NoKey,
    );

    const getGetKeyIconClass = (state: PubKeyState) => {
        switch (state) {
            case PubKeyState.KeyCreationFailed:
                return <Icon iconClass="fas fa-exclamation-circle" />;

            case PubKeyState.WaitingForKeyCreation:
                return <Icon iconClass="fas fa-spinner fa-spin" />;

            case PubKeyState.WaitingForPublication:
            case PubKeyState.PublicationFailed:
            case PubKeyState.KeyPublished:
            case PubKeyState.KeyCreated:
                return <Icon iconClass="fas fa-check-circle" />;

            default:
                return null;
        }
    };

    const getPublishIconClass = (state: PubKeyState) => {
        switch (state) {
            case PubKeyState.PublicationFailed:
                return <Icon iconClass="fas fa-exclamation-circle" />;

            case PubKeyState.WaitingForPublication:
                return <Icon iconClass="fas fa-spinner fa-spin" />;

            case PubKeyState.KeyPublished:
                return <Icon iconClass="fas fa-check-circle" />;

            default:
                return null;
        }
    };

    const createPubKey = async () => {
        setPubKeyState(PubKeyState.WaitingForKeyCreation);
        try {
            const pubKey = await createEncryptionPublicKey(
                props.apiConnection,
                getEncryptionPublicKey,
            );
            await submitPublicKey(
                props.apiConnection,
                pubKey,
                submitPublicKeyApi,
            );
            props.setEncryptionPublicKey(pubKey);
            setPubKeyState(PubKeyState.KeyCreated);
        } catch (e) {
            setPubKeyState(PubKeyState.KeyCreationFailed);
        }
    };

    return (
        <div className="row d-flex justify-content-center ">
            <div className="col-md-12 row-space">
                <button
                    onClick={createPubKey}
                    type="button"
                    className={`btn btn-${
                        pubKeyState === PubKeyState.KeyCreationFailed
                            ? 'danger'
                            : 'primary'
                    } btn-lg w-100`}
                    disabled={
                        !(
                            pubKeyState === PubKeyState.NoKey ||
                            pubKeyState === PubKeyState.KeyCreationFailed
                        )
                    }
                >
                    Add Public Key
                    <span className="push-end">
                        {getGetKeyIconClass(pubKeyState)}
                    </span>
                </button>
            </div>
            <div className="col-md-12 row-space-2">
                <button
                    onClick={createPubKey}
                    type="button"
                    className={`btn btn-${
                        pubKeyState === PubKeyState.PublicationFailed
                            ? 'danger'
                            : 'primary'
                    } btn-lg w-100`}
                    disabled={true}
                >
                    Publish (comming soon)
                    <span className="push-end">
                        {getPublishIconClass(pubKeyState)}
                    </span>
                </button>
            </div>
            <div className="col-md-12 row-space">
                <button
                    onClick={props.switchToSignedIn}
                    type="button"
                    className={`btn btn-outline-secondary btn-lg w-100`}
                    disabled={
                        !(
                            pubKeyState === PubKeyState.KeyCreated ||
                            pubKeyState === PubKeyState.PublicationFailed
                        )
                    }
                >
                    Skip Publish
                </button>
            </div>
        </div>
    );
}

export default AddPubKeyView;
