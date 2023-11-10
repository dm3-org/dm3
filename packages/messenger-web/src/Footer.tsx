import React from 'react';

const Footer: React.FC = () => {
    return (
        <nav
            className="navbar fixed-bottom navbar-light "
            style={{ backgroundColor: '#000000ff !important' }}
        >
            <div className="container-fluid text-center ">
                <div className="w-100">
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

export default Footer;
