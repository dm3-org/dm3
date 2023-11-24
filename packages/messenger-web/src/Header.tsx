import React from 'react';

const Header: React.FC = () => {
    return (
        <nav className="navbar fixed-top navbar-light" >
            <a href="https://dm3.network" target="_blank" style={{ position: 'absolute', top: '26px', left: '21px' }}>
                <img
                    src="/dm3-logo.png"
                    alt="dm3 Network Logo"
                    style={{ height: '29px', transition: 'transform 0.5s ease' }} // Stelle die Größe nach Bedarf ein
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </a>
        </nav>

    );
};

export default Header;
