import React from 'react';
import './Header.css';

// Define the Header component
const Header: React.FC = () => {
    // Define the handlers for the mouse over and mouse out events
    const handleMouseOver = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) => {
        e.currentTarget.style.transform = 'scale(1.2)';
    };
    const handleMouseOut = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    ) => {
        e.currentTarget.style.transform = 'scale(1)';
    };

    // Return the JSX for this component
    return (
        <nav className="navbar fixed-top navbar-light">
            <a
                href="https://dm3.network"
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'absolute', top: '26px', left: '21px' }}
            >
                <img
                    src="/dm3-logo.png"
                    alt="dm3 Network Logo"
                    style={{
                        height: '29px',
                        transition: 'transform 0.5s ease',
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                />
            </a>

            <a
                href="https://old-app.dm3.network"
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'absolute', top: '26px', right: '21px' }}
            >
                <button className="normal-btn-border beta-btn ">
                    Open old Version: <b>Beta2</b>
                </button>
            </a>
        </nav>
    );
};

export default Header;
