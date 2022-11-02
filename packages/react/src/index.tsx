import 'react-app-polyfill/stable';
import React from 'react';
import DM3 from './Dm3';
import './index.css';
import GlobalContextProvider from './GlobalContextProvider';
import { Config, getConfig } from './utils/Config';
import * as Lib from 'dm3-lib';

export * as DarkLogo from './logos/DarkLogo';
export const ConnectionState = Lib.web3provider.ConnectionState;

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
