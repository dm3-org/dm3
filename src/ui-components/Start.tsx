import Icon from './ui-shared/Icon';
import { useContext } from 'react';
import { GlobalContext } from './GlobalContextProvider';

function Start() {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <div
            className={`w-100${
                state.accounts.contacts && state.accounts.contacts.length > 0
                    ? ' start-space'
                    : ''
            }`}
        >
            <Icon iconClass="fas fa-arrow-left" />{' '}
            <strong>
                {state.accounts.contacts !== undefined &&
                state.accounts.contacts.length > 0
                    ? 'Select a contact to start messaging'
                    : 'Add a contact to start'}
            </strong>
        </div>
    );
}

export default Start;
