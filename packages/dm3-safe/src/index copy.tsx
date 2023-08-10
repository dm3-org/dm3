import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { theme, Loader, Title } from '@gnosis.pm/safe-react-components';
import SafeProvider from '@safe-global/safe-apps-react-sdk';

import GlobalStyle from './GlobalStyle';
import App from './App';

// @ts-ignore

import { DM3 } from 'dm3-react';

ReactDOM.render(
    <React.StrictMode>
        {/*     <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SafeProvider
        loader={
          <>
            <Title size="md">Waiting for Safe...</Title>
            <Loader size="md" />
          </>
        }
      >
        <App/>
      </SafeProvider>
    </ThemeProvider> */}
        <DM3
            defaultContacts={['help.dm3.eth']}
            defaultServiceUrl={process.env.REACT_APP_DEFAULT_SERVICE}
            showAlways={true}
        />
        <p>Gooolklklo</p>
    </React.StrictMode>,
    document.getElementById('root'),
);
