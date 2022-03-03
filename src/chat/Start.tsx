import Icon from '../ui-shared/Icon';
import * as Lib from '../lib';

interface StartProps {
    contacts: Lib.Account[] | undefined;
    apiConnection: Lib.ApiConnection;
    changeApiConnection: (apiConnection: Partial<Lib.ApiConnection>) => void;
}

function Start(props: StartProps) {
    return (
        <div
            className={`w-100${
                props.contacts && props.contacts.length > 0
                    ? ' start-space'
                    : ''
            }`}
        >
            <Icon iconClass="fas fa-arrow-left" />{' '}
            <strong>
                {props.contacts !== undefined && props.contacts.length > 0
                    ? 'Select a contact to start messaging'
                    : 'Add a contact to start'}
            </strong>
        </div>
    );
}

export default Start;
