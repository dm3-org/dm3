// Import React and the CSS for this component
import React from 'react';
import './Dm3Widget.css';

// Ignore TypeScript errors for the next line
//@ts-ignore
// Import the DM3 component from the 'messenger-widget' package
import { DM3 } from '@dm3-org/dm3-messenger-widget';

// Define the Dm3Widget component
const Dm3Widget: React.FC = () => {
    // Define the props for the DM3 component
    const props: any = {
        defaultContact: 'contact.dm3.eth',

        userEnsSubdomain: process.env.REACT_APP_USER_ENS_SUBDOMAIN as string,
        addressEnsSubdomain: process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
        resolverBackendUrl: process.env.REACT_APP_RESOLVER_BACKEND as string,
        profileBaseUrl: process.env.REACT_APP_PROFILE_BASE_URL as string,
        defaultDeliveryService: process.env.REACT_APP_DEFAULT_DELIVERY_SERVICE as string,
        backendUrl: process.env.REACT_APP_BACKEND as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        resolverAddress: process.env.REACT_APP_RESOLVER_ADDR as string,
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE as string,
        ethereumProvider: process.env.REACT_APP_ETHEREUM_PROVIDER as string,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string,

        showAlways: true,
        hideFunction: 'attachments', // Optional parameter: 'attachments,edit,delete' or undefined
        showContacts: true, // true for all contacts / false for default contact
    };

    // Return the JSX for this component
    return (
        // A div that contains the DM3 component
        <div className="dm3widget">
            <DM3 {...props} />
        </div>
    );
};

// Export the Dm3Widget component as the default export
export default Dm3Widget;
