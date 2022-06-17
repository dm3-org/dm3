import 'react-app-polyfill/stable';
import React from 'react';
import EnsMail from './EnsMail';
import './index.css';

import GlobalContextProvider from './GlobalContextProvider';
import { Config, getConfig } from './utils/Config';

function index(props: Partial<Config>) {
    return (
        <div className="entry">
            <GlobalContextProvider>
                <EnsMail config={getConfig(props)} />
            </GlobalContextProvider>
        </div>
    );
}

export default index;
