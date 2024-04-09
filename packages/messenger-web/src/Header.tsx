import React from 'react';
import './Header.css'; // Import the CSS file for styling
import { useMessageTo } from './useMessageTo'; // Import the custom hook to get the messageTo parameter

// Define the Header component as a functional component
const Header: React.FC = () => {
    // Use the useMessageTo hook to check if the messageTo parameter is set
    const [messageTo, isMessageToSet] = useMessageTo();

    // Handler for mouse over event on the logo
    const handleMouseOver = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.currentTarget.style.transform = 'scale(1.1)'; // Scale up the logo
        e.currentTarget.style.transition = 'transform 0.3s ease'; // Smooth transition for the transform
    };

    // Handler for mouse out event on the logo
    const handleMouseOut = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        e.currentTarget.style.transform = 'scale(1)'; // Reset the logo scale to its original size
    };

    return (
        // Navigation bar container
        <nav className="navbar fixed-top navbar-light">
            <a href="https://dm3.network" target="_blank" rel="noopener noreferrer" className="logo-link">
                <img
                    src="/dm3-logo.png" // Logo image source
                    alt="dm3 Network Logo" // Alternative text for the logo
                    style={{ height: '29px' }} // Inline styling to set the logo height
                    onMouseOver={handleMouseOver} // Apply the mouse over handler
                    onMouseOut={handleMouseOut} // Apply the mouse out handler
                />
            </a>

            {/* Conditionally render the message tag if the messageTo parameter is set */}
            {isMessageToSet() && (
                <div className="message-tag">
                    <span style={{ fontWeight: '300' }}>Send message to:</span>
                    <strong style={{ marginLeft: '5px' }}>{messageTo}</strong>
                </div>
            )}
        </nav>
    );
};

export default Header; // Export the Header component for use in other parts of the application
