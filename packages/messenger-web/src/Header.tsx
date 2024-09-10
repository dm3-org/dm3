import React from 'react';
import './Header.css'; // Import the CSS file for styling
import { useMessageToContext } from './parameter/messageto/MessageToContext'; // Import the custom hook context to get the messageTo parameter

// Define the Header component as a functional component
const Header: React.FC = () => {
    // Use the useMessageTo hook to check if the messageTo parameter is set
    const { messageTo, isMessageToSet } = useMessageToContext();

    return (
        // Navigation bar container
        <nav className="navbar_header fixed-top navbar-light">
            <a
                href="https://dm3.network"
                target="_blank"
                rel="noopener noreferrer"
                className="logo-link"
            >
                <img src="/dm3-logo.png" alt="dm3 Network Logo" />
            </a>

            {/* Conditionally render the message tag if the messageTo parameter is set */}
            {isMessageToSet && (
                <div className="message-tag">
                    <span>Send message to:</span>
                    <strong>{messageTo}</strong>
                </div>
            )}
        </nav>
    );
};

export default Header; // Export the Header component for use in other parts of the application
