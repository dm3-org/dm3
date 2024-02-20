import { Heading } from './Heading';

export function Network() {
    const heading = 'Network';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="network"></div>
        </div>
    );
}
