import * as ReactDOM from 'react-dom/client';
import './index.css';
import { DM3 } from './widget';
import React from 'react';
import Demo from './demo';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);
root.render(
    <React.StrictMode>
        <Demo />
    </React.StrictMode>,
);
