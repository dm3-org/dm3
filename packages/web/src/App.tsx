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
                defaultContact="0x503402394c9c4CDF8CD0B29a050743726aFee921"
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
