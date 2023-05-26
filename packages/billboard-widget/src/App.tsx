import './styles/app.pcss';

import { AuthContextProvider } from './context/AuthContext';
import { GlobalContextProvider } from './context/GlobalContext';
import { BillboardWidgetProps } from './types';
import { MessengerView } from './views/MessengerView';

function App(props: BillboardWidgetProps) {
    return (
        <>
            <GlobalContextProvider
                {...props}
                clientProps={props.clientProps}
                web3Provider={props.web3Provider}
            >
                <AuthContextProvider>
                    <MessengerView />
                </AuthContextProvider>
            </GlobalContextProvider>
        </>
    );
}

export default App;
