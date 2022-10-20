import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'dm3-lib';
import { connectionPhase } from './Phases';

interface StorageLocationSelectionProps {
    setStorageLocation: (location: Lib.storage.StorageLocation) => void;
    stroageLocation: Lib.storage.StorageLocation;
}

function StorageLocationSelection(props: StorageLocationSelectionProps) {
    const keys = Object.keys(
        Lib.storage.StorageLocation,
    ) as (keyof typeof Lib.storage.StorageLocation)[];

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <div className="list-group ">
                    {keys.map((key) => {
                        const selected =
                            props.stroageLocation ===
                            Lib.storage.StorageLocation[
                                key as keyof typeof Lib.storage.StorageLocation
                            ];
                        return (
                            <a
                                href="#"
                                className={`list-group-item list-group-item-action storage-item ${
                                    selected ? 'storage-item-selected' : ''
                                }`}
                                onClick={() => {
                                    if (
                                        (Lib.storage.StorageLocation[
                                            key as keyof typeof Lib.storage.StorageLocation
                                        ] as Lib.storage.StorageLocation) ===
                                        Lib.storage.StorageLocation.dm3Storage
                                    ) {
                                        props.setStorageLocation(
                                            Lib.storage.StorageLocation[
                                                key as keyof typeof Lib.storage.StorageLocation
                                            ] as Lib.storage.StorageLocation,
                                        );
                                    }
                                }}
                                key={key}
                            >
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id="flexRadioDefault2"
                                    checked={selected}
                                    disabled={
                                        (Lib.storage.StorageLocation[
                                            key as keyof typeof Lib.storage.StorageLocation
                                        ] as Lib.storage.StorageLocation) !==
                                        Lib.storage.StorageLocation.dm3Storage
                                    }
                                    readOnly
                                />
                                &nbsp;&nbsp;
                                {Lib.storage.StorageLocation[key] === 'File'
                                    ? 'Browser / File Export'
                                    : Lib.storage.StorageLocation[key]}{' '}
                                {(Lib.storage.StorageLocation[
                                    key as keyof typeof Lib.storage.StorageLocation
                                ] as Lib.storage.StorageLocation) !==
                                    Lib.storage.StorageLocation.dm3Storage && (
                                    <span className="badge bg-light text-dark">
                                        coming soon
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </div>
            </div>
            <div className="col-md-7 help-text">
                Select storage location
                <p className="explanation">
                    {props.stroageLocation ===
                        Lib.storage.StorageLocation.File &&
                        'The messages and related data will be encrypted and stored on your local file system.' +
                            ' Every time you sign in the file must be uploaded.'}
                    {props.stroageLocation ===
                        Lib.storage.StorageLocation.Web3Storage &&
                        'The messages and related data will be encrypted and stored ' +
                            'using the decentral web3.storage service.' +
                            ' web3.storage is based on the IPFS protocol and ensures redudancy.'}
                    {props.stroageLocation ===
                        Lib.storage.StorageLocation.dm3Storage &&
                        'The messages and related data will be encrypted and stored ' +
                            'using the dm3 Storage Service.' +
                            ' The data can only be decrypted by the owner of the related Ethereum Account Key.'}
                </p>
            </div>
        </div>
    );
}

export default StorageLocationSelection;
