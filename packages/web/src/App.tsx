import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import DM3, { ConnectionState } from 'dm3-react';

function App() {
    const [showLogo, setShowLogo] = useState(false);

    return (
        <>
            <DM3
                defaultContact="0x3169be33e0d5d44ee4dccd39d7be47d6153bfd3a"
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
                        <div
                            style={{
                                fontSize: '35px',
                                filter: 'brightness(90%)',
                            }}
                            className="d-flex"
                        >
                            <img
                                src="./dm3_Signet_blue-gray.svg"
                                width="50px"
                                alt="logo"
                            />
                            <div className="align-self-center">
                                <span
                                    className="ms-2"
                                    style={{
                                        fontWeight: '650',
                                        color: '#323332',
                                        fontSize: '40px',
                                    }}
                                >
                                    dm
                                </span>
                                <span
                                    style={{
                                        fontWeight: '250',
                                        color: '#5880de',
                                        fontSize: '40px',
                                    }}
                                >
                                    3
                                </span>
                            </div>
                        </div>
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
