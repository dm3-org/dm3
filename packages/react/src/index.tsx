import 'react-app-polyfill/stable';
import DM3App from './Dm3';
import GlobalContextProvider from './GlobalContextProvider';
import './index.css';
import { Config, getConfig } from './utils/Config';

export * as DarkLogo from './logos/DarkLogo';

export function DM3(props: Partial<Config>) {
    return (
        <div className="entry">
            <GlobalContextProvider>
                <DM3App config={getConfig(props)} />
            </GlobalContextProvider>
        </div>
    );
}
