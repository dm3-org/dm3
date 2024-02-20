'use client';

import styles from './page.module.css';

//@ts-ignore
import { DM3 } from '@dm3-org/dm3-messenger-widget';

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
            <DM3 {...props} />
        </main>
    );
}
