import { StorageLocation } from 'dm3-lib-storage';

interface StorageLocationSelectionProps {
    setStorageLocation: (location: StorageLocation) => void;
    stroageLocation: StorageLocation;
}

function StorageLocationSelection(props: StorageLocationSelectionProps) {
    const keys = Object.keys(
        StorageLocation,
    ) as (keyof typeof StorageLocation)[];

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <div className="list-group ">
                    {keys.map((key) => {
                        const selected =
                            props.stroageLocation ===
                            StorageLocation[
                                key as keyof typeof StorageLocation
                            ];
                        return (
                            <a
                                href="#"
                                className={`list-group-item list-group-item-action storage-item ${
                                    selected ? 'storage-item-selected' : ''
                                }`}
                                onClick={() => {
                                    if (
                                        (StorageLocation[
                                            key as keyof typeof StorageLocation
                                        ] as StorageLocation) ===
                                        StorageLocation.dm3Storage
                                    ) {
                                        props.setStorageLocation(
                                            StorageLocation[
                                                key as keyof typeof StorageLocation
                                            ] as StorageLocation,
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
                                        (StorageLocation[
                                            key as keyof typeof StorageLocation
                                        ] as StorageLocation) !==
                                        StorageLocation.dm3Storage
                                    }
                                    readOnly
                                />
                                &nbsp;&nbsp;
                                {StorageLocation[key] === 'File'
                                    ? 'Browser / File Export'
                                    : StorageLocation[key]}{' '}
                                {(StorageLocation[
                                    key as keyof typeof StorageLocation
                                ] as StorageLocation) !==
                                    StorageLocation.dm3Storage && (
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
                    {props.stroageLocation === StorageLocation.File &&
                        'The messages and related data will be encrypted and stored on your local file system.' +
                            ' Every time you sign in the file must be uploaded.'}
                    {props.stroageLocation === StorageLocation.Web3Storage &&
                        'The messages and related data will be encrypted and stored ' +
                            'using the decentral web3.storage service.' +
                            ' web3.storage is based on the IPFS protocol and ensures redudancy.'}
                    {props.stroageLocation === StorageLocation.dm3Storage &&
                        'The messages and related data will be encrypted and stored ' +
                            'using the dm3 Storage Service.' +
                            ' The data can only be decrypted by the owner of the related Ethereum Account Key.'}
                </p>
            </div>
        </div>
    );
}

export default StorageLocationSelection;
