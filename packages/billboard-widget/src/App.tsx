import './styles/app.pcss';

import { AuthContextProvider } from './context/AuthContext';
import { GlobalContextProvider } from './context/GlobalContext';
import { BillboardWidgetProps, defaultClientProps } from './types';
import { MessengerView } from './views/MessengerView';

function App(props: BillboardWidgetProps) {
    return (
        <>
            <GlobalContextProvider {...props} clientProps={defaultClientProps}>
                <AuthContextProvider>
                    <MessengerView />
                </AuthContextProvider>
            </GlobalContextProvider>
        </>
    );
}

export default App;
