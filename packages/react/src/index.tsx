import 'react-app-polyfill/stable';
import React from 'react';
import DM3 from './Dm3';
import './index.css';
import GlobalContextProvider from './GlobalContextProvider';
import { Config, getConfig } from './utils/Config';
export * as DarkLogo from './logos/DarkLogo';

export { StorageLocation, ConnectionState } from 'dm3-lib';

function index(props: Partial<Config>) {
    return (
        <div className="entry">
            <GlobalContextProvider>
                <DM3 config={getConfig(props)} />
            </GlobalContextProvider>
        </div>
    );
}

export default index;
