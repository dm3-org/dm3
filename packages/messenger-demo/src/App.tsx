import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import { DM3 } from '@dm3-org/dm3-messenger-widget';

function App() {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_ETHEREUM_PROVIDER,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showAlways: true,
        hideFunction: undefined, // OPTINAL PARAMETER : 'attachments,edit,delete' or undefined
        showContacts: true, // true for all contacts / false for default contact
        theme: undefined, // OPTINAL PARAMETER : undefined/themeColors
        signInImage: undefined, // OPTINAL PARAMETER : string URL of image
    };

    return (
        <div className="background p-1">
            <div className="demo-container">
                <DM3 {...props} />
            </div>
        </div>
    );
}

export default App;
