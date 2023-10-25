import './EnsDetails.css';
import { IEnsDetails } from '../../interfaces/props';

export function EnsDetails(props: IEnsDetails) {
    return (
        <div className="d-flex" data-testid="ens-details">
            <p data-testid="ens-details-key" className="mb-0 profile-key">
                {props.propertyKey}:
            </p>
            <span
                data-testid="ens-details-value"
                className={'ens-details'.concat(
                    props.action && props.propertyValue !== "Not set"
                        ? ' pointer-cursor text-decoration-underline'
                        : '',
                )}
                onClick={() => (props.action ? props.action() : () => { })}
            >
                {props.propertyValue}
            </span>
        </div>
    );
}
