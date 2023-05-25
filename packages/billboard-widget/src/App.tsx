import './styles/app.pcss';

import { AuthContextProvider } from './context/AuthContext';
import { GlobalContextProvider } from './context/GlobalContext';
import { BillboardWidgetProps } from './types';
import { MessengerView } from './views/MessengerView';
import { ethers } from 'ethers';

function App(props: BillboardWidgetProps) {
    return (
        <>
            <GlobalContextProvider
                {...props}
                clientProps={props.clientProps}
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
