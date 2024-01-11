import { Heading } from './Heading';

export function Notification() {
    const heading = 'Notification';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="notification"></div>
        </div>
    );
}
