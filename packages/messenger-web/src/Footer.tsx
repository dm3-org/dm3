// Import React
import React from 'react';

// Define the Footer component
const Footer: React.FC = () => {
    // Define the styles for the navbar and the container
    const navbarStyle = { backgroundColor: '#000000ff !important' };
    const containerStyle = { justifyContent: 'flex-end', display: 'flex' };
    const linkStyle = { marginRight: '10px' };

    // Return the JSX for this component
    return (
        // A fixed-bottom navbar with a black background
        <nav className="navbar fixed-bottom navbar-light" style={navbarStyle}>
            <div className="container-fluid text-center" style={containerStyle}>
                <div style={linkStyle}>
                    <a
                        className="text-muted legal"
                        href="https://dm3.network/privacy-policy/"
                    >
                        Privacy Policy
                    </a>
                    <a
                        className="text-muted legal ms-4"
                        href="https://dm3.network/terms-and-conditions/"
                    >
                        Terms & Conditions
                    </a>
                </div>
            </div>
        </nav>
    );
};

// Export the Footer component as the default export
export default Footer;
