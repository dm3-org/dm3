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
                        <DarkLogo.default />
                    </a>
                )}
            </div>
        </>
    );
}

export default App;
