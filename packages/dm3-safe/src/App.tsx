import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useEffect, useState } from 'react';

//@ts-ignore
import { DM3 } from 'dm3-react';

function App() {
    const { sdk, safe } = useSafeAppsSDK();
    sdk.safe.getEnvironmentInfo();

    useEffect(() => {
        safe.owners.forEach((owner) => {
            const ensName = `${owner}${process.env.REACT_APP_ADDR_ENS_SUBDOMAIN}`;
            setOwnersEnsNames((ownersEnsNames) => [...ownersEnsNames, ensName]);
        });
    }, []);

    const [ownersEnsNames, setOwnersEnsNames] = useState<string[]>([]);

    return (
        <>
            <DM3
                defaultContacts={['help.dm3.eth', ...ownersEnsNames]}
                defaultServiceUrl={process.env.REACT_APP_DEFAULT_SERVICE}
                showAlways={true}
                // connectionStateChange={(state: ConnectionState) =>
                //     setShowLogo(state === ConnectionState.SignedIn)
                // }
            />
            <div className="logo"></div>
            <nav
                className="navbar fixed-bottom navbar-light "
                style={{ backgroundColor: '#000000ff !important' }}
            >
                <div className="container-fluid text-center ">
                    <div className="w-100">
                        <a
                            className="text-muted legal"
                            href="https://dm3.network/privacy-policy/"
                        >
                            Privacy Policy
                        </a>
                        <a
                            className="text-muted legal ms-4"
                            href="https://dm3.network/terms-and-conditions/"
                        >
                            Terms & Conditions
                        </a>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default App;
