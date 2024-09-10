import { Heading } from '../Heading/Heading';

export function Properties() {
    const heading = 'Properties';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="properties"></div>
        </div>
    );
}
