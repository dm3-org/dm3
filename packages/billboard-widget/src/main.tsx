import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'normalize.css';
import { defaultClientProps, defaultOptions } from './types.ts';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App
            clientProps={defaultClientProps}
            options={defaultOptions}
            web3Provider={window.ethereum}
        />
    </React.StrictMode>,
);
