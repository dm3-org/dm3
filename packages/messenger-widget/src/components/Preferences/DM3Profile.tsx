import { ConfigureDM3Profile } from '../ConfigureProfile/ConfigureProfile';
import { ConfigureProfileContextProvider } from '../ConfigureProfile/context/ConfigureProfileContext';
import { Heading } from './Heading';

export function DM3Profile() {
    const heading = 'DM3 Profile Configuration';
    const description =
        'Your dm3 profile needs to be published. You can use your own ENS name, ' +
        'get a DM3 name, or keep your wallet address.';

    return (
        <div>
            <Heading heading={heading} description={description} />
            <br />
            <ConfigureProfileContextProvider>
                <ConfigureDM3Profile />
            </ConfigureProfileContextProvider>
        </div>
    );
}
