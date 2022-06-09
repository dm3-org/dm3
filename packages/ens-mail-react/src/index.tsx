import 'react-app-polyfill/stable';
import React from 'react';
import EnsMail from './EnsMail';
import './index.css';

import GlobalContextProvider from './GlobalContextProvider';

export default () => (
    <div className="entry">
        <GlobalContextProvider>
            <EnsMail inline={false} />
        </GlobalContextProvider>
    </div>
);
