'use client';

import styles from './page.module.css';
import dynamic from 'next/dynamic';

// //@ts-ignore
// import { DM3 } from '@dm3-org/dm3-messenger-widget';

{
    /* This is done to avoid document not found error while building the app.
It imports dynamically so document is used once it is loaded. 
Its done just to avoid github pipeline breaking, otherwise normald DM3 
impport and use also works*/
}
const DynamicComponentWithNoSSR = dynamic(
    () => {
        //@ts-ignore
        return import('@dm3-org/dm3-messenger-widget') as any;
    },
    { ssr: false },
);

export default function Home() {
    const props: any = {
        defaultContact: 'contact.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showContacts: true, // true for all contacts / false for default contact
        hideFunction: undefined, // OPTIONAL PARAMETER : 'attachments,edit,delete' or undefined
        theme: undefined, // OPTIONAL PARAMETER : undefined/themeColors
        signInImage: undefined, // OPTIONAL PARAMETER : string URL of image
    };

    return (
        <main className={styles.dm3Container}>
            {/* This is not used because it uses document and its not found
            while making build so pipeline fails in github */}
            {/* <DM3 {...props} /> */}

            {/* This is done to avoid document not found error while building the app.
            It imports dynamically so document is used once it is loaded. 
            Its done just to avoid github pipeline breaking, otherwise normald DM3 
            impport and use also works*/}
            <DynamicComponentWithNoSSR {...props} />
        </main>
    );
}
