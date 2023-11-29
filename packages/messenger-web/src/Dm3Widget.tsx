// Import React and the CSS for this component
import React from 'react';
import './Dm3Widget.css';

// Ignore TypeScript errors for the next line
//@ts-ignore
// Import the DM3 component from the 'messenger-widget' package
import { DM3 } from 'messenger-widget';

// Define the Dm3Widget component
const Dm3Widget: React.FC = () => {
    // Define the props for the DM3 component
    const props: any = {
        defaultContact: 'receiver.beta-user.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_ETHEREUM_PROVIDER,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showAlways: true,
        hideFunction: 'attachments,edit,delete', // Optional parameter: 'attachments,edit,delete' or undefined
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