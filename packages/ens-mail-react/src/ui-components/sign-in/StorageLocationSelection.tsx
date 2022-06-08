import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import * as Lib from 'ens-mail-lib';
import { connectionPhase } from './Phases';

interface StorageLocationSelectionProps {
    setStorageLocation: (location: Lib.StorageLocation) => void;
    stroageLocation: Lib.StorageLocation;
}

function StorageLocationSelection(props: StorageLocationSelectionProps) {
    const keys = Object.keys(
        Lib.StorageLocation,
    ) as (keyof typeof Lib.StorageLocation)[];

    const { state } = useContext(GlobalContext);

    if (connectionPhase(state.connection.connectionState)) {
        return null;
    }

    return (
        <div className="row row-space">
            <div className="col-md-5">
                <div className="list-group ">
                    {keys.map((key) => {
                        const selected =
                            props.stroageLocation ===
                            Lib.StorageLocation[
                                key as keyof typeof Lib.StorageLocation
                            ];
                        return (
                            <a
                                href="#"
                                className={
                                    'list-group-item list-group-item-action'
                                }
                                onClick={() =>
                                    props.setStorageLocation(
                                        Lib.StorageLocation[
                                            key as keyof typeof Lib.StorageLocation
                                        ] as Lib.StorageLocation,
                                    )
                                }
                                key={key}
                            >
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id="flexRadioDefault2"
                                    checked={selected}
                                    readOnly
                                />
                                &nbsp;&nbsp;
                                {Lib.StorageLocation[key]}
                            </a>
                        );
                    })}
                </div>
            </div>
            <div className="col-md-7 help-text">
                Select storage location
                <p className="explanation">
                    {props.stroageLocation === Lib.StorageLocation.File &&
                        'The messages and related data will be encrypted and stored on your local file system.' +
                            ' Every time you sign in the file must be uploaded.'}
                    {props.stroageLocation ===
                        Lib.StorageLocation.Web3Storage &&
                        'The messages and related data will be encrypted and stored ' +
                            'using the decentral web3.storage service.' +
                            ' web3.storage is based on the IPFS protocol and ensures redudancy.'}
                </p>
            </div>
        </div>
    );
}

export default StorageLocationSelection;
