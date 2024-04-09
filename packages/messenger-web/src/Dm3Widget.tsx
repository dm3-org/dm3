import React from 'react';
import './Dm3Widget.css';

// Custom hook to manage message destination
import { useMessageTo } from './useMessageTo';
// Importing the DM3 component and its configuration type from the DM3 Messenger Widget package
import { DM3, DM3Configuration } from '@dm3-org/dm3-messenger-widget';

/**
 * Helper function to generate a weekly-based pseudo-random image path.
 * It uses the current week of the year to ensure the image remains consistent throughout the week,
 * but changes weekly.
 * @returns The path to the selected image.
 */
const getWeeklyImagePath = (): string => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 86400000; // Milliseconds per day
    const dayOfYear = Math.floor(diff / oneDay);
    const weekOfYear = Math.floor(dayOfYear / 7);

    const simpleHash = (week: number): number => {
        let hash = 0;
        const str = week.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    const numberOfImages = 12; // Adjust based on the actual number of images available
    const index = simpleHash(weekOfYear) % numberOfImages;
    const imageName = `${(index + 1).toString().padStart(3, '0')}.jpg`;
    return `/signin/${imageName}`; // Adjust the path as needed
};

/**
 * The Dm3Widget component integrates the DM3 messenger widget with additional logic
 * for dynamic image selection based on the week of the year.
 */
const Dm3Widget: React.FC = () => {
    // Use the custom hook to get the message destination and check if it's set
    const [messageTo, isMessageToSet] = useMessageTo();

    // Determine the image path using the helper function
    const signInImagePath = getWeeklyImagePath();

    // Define the configuration props for the DM3 component
    const props: DM3Configuration = {
        defaultContact: isMessageToSet() ? messageTo! : 'contact.dm3.eth',
        userEnsSubdomain: process.env.REACT_APP_USER_ENS_SUBDOMAIN as string,
        addressEnsSubdomain: process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
        resolverBackendUrl: process.env.REACT_APP_RESOLVER_BACKEND as string,
        profileBaseUrl: process.env.REACT_APP_PROFILE_BASE_URL as string,
        defaultDeliveryService: process.env.REACT_APP_DEFAULT_DELIVERY_SERVICE as string,
        backendUrl: process.env.REACT_APP_BACKEND as string,
        chainId: process.env.REACT_APP_CHAIN_ID as string,
        resolverAddress: process.env.REACT_APP_RESOLVER_ADDR as string,
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE as string,
        ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC as string,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string,
        showAlways: true,
        hideFunction: 'attachments', // Optional parameter to hide certain UI elements
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
