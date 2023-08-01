import './EnsDetails.css';
import { EnsDetails } from '../../interfaces/props';

export function EnsDetails(props: EnsDetails) {
    return (
        <div className="d-flex">
            <p className="mb-0 profile-key">{props.propertyKey}:</p>
            <span className="ens-details">{props.propertyValue}</span>
        </div>
    );
}
