import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import EnsMail from 'ens-mail-react';

function App() {
    return (
        <div className="container">
            <EnsMail inline={true} />
        </div>
    );
}

export default App;
