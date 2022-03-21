import './SignInHelp.css';
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
            {keys.map((key) => (
                <a
                    href="#"
                    className={
                        'list-group-item list-group-item-action' +
                        (props.stroageLocation === key ? ' active' : '')
                    }
                    onClick={() =>
                        props.setStorageLocation(key as Lib.StorageLocation)
                    }
                    key={key}
                >
                    {Lib.StorageLocation[key]}
                </a>
            ))}
        </div>
    );
}

export default StorageLocationSelection;
