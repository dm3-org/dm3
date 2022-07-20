import React, { useEffect, useRef, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import DM3, { DarkLogo, ConnectionState } from 'dm3-react';

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
                    <a href="https://dm3.me/" target="_blank" rel="noreferrer">
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
                            />
                            <div className="align-self-center">
                                <span
                                    className="ms-3"
                                    style={{
                                        fontWeight: '600',
                                        color: '#323332',
                                        fontSize: '40px',
                                    }}
                                >
                                    dm
                                </span>
                                <span
                                    style={{
                                        fontWeight: '400',
                                        color: '#323332',
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
        </>
    );
}

export default App;
