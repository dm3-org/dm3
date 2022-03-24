import * as Lib from '../lib';

interface StorageLocationSelectionProps {
    setStorageLocation: (location: Lib.StorageLocation) => void;
    stroageLocation: Lib.StorageLocation;
}

function StorageLocationSelection(props: StorageLocationSelectionProps) {
    const keys = Object.keys(
        Lib.StorageLocation,
    ) as (keyof typeof Lib.StorageLocation)[];

    return (
        <div className="list-group row-space">
            {keys.map((key) => {
                const selected =
                    props.stroageLocation ===
                    Lib.StorageLocation[
                        key as keyof typeof Lib.StorageLocation
                    ];
                return (
                    <a
                        href="#"
                        className={'list-group-item list-group-item-action'}
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
    );
}

export default StorageLocationSelection;
