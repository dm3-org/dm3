import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import { DM3, ConnectionState } from 'dm3-react';

function App() {
    const [showLogo, setShowLogo] = useState(false);

    return (
        <>
            <DM3
                // defaultContact="0x3169be33e0d5d44ee4dccd39d7be47d6153bfd3a"
                showAlways={true}
                connectionStateChange={(state) =>
                    setShowLogo(state === ConnectionState.SignedIn)
                }
            />
            <div className="logo">
                {showLogo && (
                    <a
                        href="https://dm3.network/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src="./dm3-logo.png" height="30" alt="logo" />
                    </a>
                )}
            </div>
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
        </>
    );
}

export default App;
