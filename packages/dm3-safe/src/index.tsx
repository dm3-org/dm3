import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { theme, Loader, Title } from '@gnosis.pm/safe-react-components';
import SafeProvider from '@safe-global/safe-apps-react-sdk';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './GlobalStyle';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <SafeProvider
                loader={
                    <>
                        <Title size="md">Waiting for Safe...</Title>
                        <Loader size="md" />
                    </>
                }
            >
                <App />
            </SafeProvider>
        </ThemeProvider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
