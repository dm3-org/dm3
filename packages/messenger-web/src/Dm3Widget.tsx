import React from 'react';
import './Dm3Widget.css';

//@ts-ignore
import { DM3 } from 'messenger-widget';

const Dm3Widget: React.FC = () => {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_ETHEREUM_PROVIDER,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showAlways: true,
    };

    return (
        <div className="dm3widget">

            <DM3 {...props} />

        </div>
    );
};

export default Dm3Widget;
