import React, { useEffect, useRef, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import EnsMail, { DarkLogo, ConnectionState } from 'ens-mail-react';

import { generateBackground } from './Background';

function App() {
    const [showLogo, setShowLogo] = useState(false);

    return (
        <>
            <EnsMail
                showAlways={true}
                connectionStateChange={(state) =>
                    setShowLogo(state === ConnectionState.SignedIn)
                }
            />
            <div className="logo">
                {showLogo && (
                    <a
                        href="https://ensmail.com/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <DarkLogo.default />
                    </a>
                )}
            </div>
        </>
    );
}

export default App;
