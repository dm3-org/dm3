import React from 'react';
import './Dm3Widget.css';

// Custom hook context to manage message destination
import { useMessageToContext } from './parameter/messageto/MessageToContext';
// Importing the DM3 component and its configuration type from the DM3 Messenger Widget package
import { DM3, DM3Configuration } from '@dm3-org/dm3-messenger-widget';
// Import helper function to get the dynamic image path (randomly chosen per week)
import { getWeeklyImagePath } from './utils/getWeeklyImagePath';

/**
 * The Dm3Widget component integrates the DM3 messenger widget with additional logic
 * for dynamic image selection based on the week of the year.
 */
const Dm3Widget: React.FC = () => {
    // Use the custom hook to get the message destination and check if it's set
    const { messageTo, isMessageToSet } = useMessageToContext();

    // Determine the image path using the helper function
    const signInImagePath = getWeeklyImagePath();

    // Define the configuration props for the DM3 component
    const props: DM3Configuration = {
        defaultContact: isMessageToSet() ? messageTo! : 'contact.dm3.eth', // If messageTo is set, use it as the default contact
        userEnsSubdomain: process.env.REACT_APP_USER_ENS_SUBDOMAIN as string,
        addressEnsSubdomain: process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
        resolverBackendUrl: process.env.REACT_APP_RESOLVER_BACKEND as string,
        profileBaseUrl: process.env.REACT_APP_PROFILE_BASE_URL as string,
        defaultDeliveryService: process.env
            .REACT_APP_DEFAULT_DELIVERY_SERVICE as string,
        backendUrl: process.env.REACT_APP_BACKEND as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        resolverAddress: process.env.REACT_APP_RESOLVER_ADDR as string,
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE as string,
        ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC as string,
        walletConnectProjectId: process.env
            .REACT_APP_WALLET_CONNECT_PROJECT_ID as string,
        genomeRegistryAddress: process.env
            .REACT_APP_GENOME_REGISTRY_ADDRESS as string,
        showAlways: true,
        showContacts: !isMessageToSet(), // Show all contacts or only the default based on the message destination
        signInImage: signInImagePath, // Dynamic image path based on the current week
    };

    // Render the DM3 component wrapped in a div container
    return (
        <div className="dm3widget">
            <DM3 {...props} />
        </div>
    );
};

// Export the Dm3Widget component as the default export
export default Dm3Widget;
