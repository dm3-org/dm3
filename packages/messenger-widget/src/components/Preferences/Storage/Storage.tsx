import { Heading } from '../Heading/Heading';

export function Storage() {
    const heading = 'Storage';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="storage"></div>
        </div>
    );
}
