import './styles/app.pcss';

import { AuthContextProvider } from './context/AuthContext';
import { GlobalContextProvider } from './context/GlobalContext';
import { BillboardWidgetProps, defaultClientProps } from './types';
import { MessengerView } from './views/MessengerView';
import { ethers } from 'ethers';

function App(props: BillboardWidgetProps) {
    return (
        <>
            <GlobalContextProvider
                {...props}
                clientProps={defaultClientProps}
                web3Provider={
                    new ethers.providers.Web3Provider(window.ethereum)
                }
            >
                <AuthContextProvider>
                    <MessengerView />
                </AuthContextProvider>
            </GlobalContextProvider>
        </>
    );
}

export default App;
