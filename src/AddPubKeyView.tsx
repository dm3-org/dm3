import { useState } from 'react';
import AddPubKey from './AddPubKey';

import { getPublicKey } from './external-apis/InjectedWeb3API';

import { submitKeys as submitPublicKeyApi } from './external-apis/BackendAPI';
import Icon from './Icon';
import {
    ApiConnection,
    createMessagingKeyPair,
    createPublicKey,
    Keys,
    submitKeys,
} from './lib/Web3Provider';

interface AddPubKeyViewProps {
    apiConnection: ApiConnection;
    setPublicKey: (keys: Keys) => void;
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
            const messagingKeyPair = createMessagingKeyPair();

            const keys: Keys = {
                publicMessagingKey: messagingKeyPair.publicKey,
                privateMessagingKey: messagingKeyPair.privateKey,
                publicKey: await createPublicKey(
                    props.apiConnection,
                    getPublicKey,
                ),
            };

            await submitKeys(props.apiConnection, keys, submitPublicKeyApi);
            props.setPublicKey(keys);
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
                    Create Public Key
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
