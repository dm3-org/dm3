// Import React and the CSS for this component
import React from 'react';
import './Background.css';

// Define the Background component
const Background: React.FC = () => {
    // Return the JSX for this component
    return (
        // The main div that contains the background
        // 2 different moving gradients
        <div className="background">
            <div className="gradient gradient-right" />
            <div className="gradient gradient-left" />
        </div>
    );
};

// Export the Background component as the default export
export default Background;