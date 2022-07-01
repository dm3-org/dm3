import React, { useEffect, useRef, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import EnsMail, { DarkLogo, ConnectionState } from 'ens-mail-react';

import { generateBackground } from './Background';

function App() {
    const threeContainer = useRef<HTMLDivElement>(null);

    useEffect(() => generateBackground(threeContainer));

    const [showLogo, setShowLogo] = useState(false);

    return (
        <>
            <div ref={threeContainer} className="w-100 h-100 "></div>
            <EnsMail
                showAlways={true}
                connectionStateChange={(state) =>
                    setShowLogo(state === ConnectionState.SignedIn)
                }
            />

            <div className="logo">{showLogo && <DarkLogo.default />}</div>
        </>
    );
}

export default App;
