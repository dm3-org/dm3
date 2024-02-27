import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import { DM3 } from '@dm3-org/dm3-messenger-widget';

interface ColoredComponentProps {
    color: string;
    children: React.ReactNode;
}

const ColoredComponent: React.FC<ColoredComponentProps> = ({
    color,
    children,
}) => {
    return (
        <div
            style={{
                backgroundColor: color,
                color: 'white',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {children}
        </div>
    );
};

function App() {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        showAlways: true,
        hideFunction: undefined, // OPTINAL PARAMETER : 'attachments,edit,delete' or undefined
        showContacts: true, // true for all contacts / false for default contact
        theme: undefined, // OPTINAL PARAMETER : undefined/themeColors
        signInImage: undefined, // OPTINAL PARAMETER : string URL of image
    };

    return (
        <div className="background p-1">
            {/* Widget in a container which has no height, so need to provide in css */}
            {/* <div className="demo-container">
                <DM3 {...props} />
            </div> */}

            {/* Widget in a container which has some height already */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                }}
            >
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <ColoredComponent color="yellow">
                            Gelbe Demo-Komponente
                        </ColoredComponent>
                    </div>

                    <div
                        className="demo-container"
                        style={{ flex: 1, overflow: 'auto' }}
                    >
                        <DM3 {...props} />
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <ColoredComponent color="blue">
                            Blaue Demo-Komponente
                        </ColoredComponent>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <ColoredComponent color="green">
                            Grüne Demo-Komponente
                        </ColoredComponent>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
