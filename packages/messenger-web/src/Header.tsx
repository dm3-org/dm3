import React from 'react';

const Header: React.FC = () => {
    return (
        <nav className="navbar fixed-top navbar-light" style={{ backgroundColor: '#000000ff' }}>
            <a href="https://dm3.network" target="_blank" style={{ position: 'absolute', top: '20px', left: '2%' }}>
                <img
                    src="/dm3-logo.png"
                    alt="dm3 Network Logo"
                    style={{ height: '50px', transition: 'transform 0.3s ease' }} // Stelle die Größe nach Bedarf ein
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
            </a>
        </nav>

    );
};

export default Header;
