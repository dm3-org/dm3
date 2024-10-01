import { Heading } from '../Heading/Heading';
import './Settings.css';

export function Settings() {
    const heading = 'Settings';
    const description = 'Define how you want to enable/disable components';


    return (
        <div>
            <Heading heading={heading} description={description} />
            <div className="">

            </div>
        </div>
    );
}
