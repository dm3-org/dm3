import Icon from './Icon';

interface StartProps {
    contacts: string[] | undefined;
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
                    ? 'Select a contact to start'
                    : 'Add a contact to start'}
            </strong>
        </div>
    );
}

export default Start;
