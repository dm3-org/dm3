import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import { DM3 } from 'messenger-widget';

function App() {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_ETHEREUM_PROVIDER,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showAlways: true,
    };

    return (
        <div className="background p-1">
            <DM3 {...props} />
        </div>
    );
}

export default App;
