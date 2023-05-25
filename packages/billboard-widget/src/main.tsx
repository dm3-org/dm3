import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'normalize.css';
import { BillboardWidgetProps, ClientProps } from './types.ts';
import { ethers } from 'ethers';
const dummySiweOwner = new ethers.Wallet(
    '0xa3366f151f21907c765632ae41498c3863ef15a1e7350f95b453c32743b6fa3d',
);
export const defaultClientProps: ClientProps = {
    mockedApi: false,
    billboardId: 'billboard1.billboard.ethprague.dm3.eth',
    billboardClientUrl: 'https://billboard-ethprague-client.herokuapp.com/',
    deliveryServiceEnsName: 'ethprague-ds.dm3.eth',
    offchainResolverUrl: 'https://billboard-ethprague.herokuapp.com',

    siweAddress: dummySiweOwner.address,
    siweSig:
        // eslint-disable-next-line max-len
        '0xb320a80194f35d2a7ab44eaaeffe77eb1d361334162417c546d42e8eb7e718a724b0436f08f971b96245401c9e80689892c8ad04ab352a99c4f6bd10c8aaad091c',
    siweMessage: dummySiweOwner.address,
};

export const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App
            clientProps={defaultClientProps}
            options={defaultOptions}
            web3Provider={window.ethereum}
        />
    </React.StrictMode>,
);
