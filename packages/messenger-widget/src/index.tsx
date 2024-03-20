import * as ReactDOM from 'react-dom/client';
import React from 'react';
import { Demo } from './demo';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);

root.render(
    <React.StrictMode>
        <Demo />
    </React.StrictMode>,
);
