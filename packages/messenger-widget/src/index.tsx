import './index.css';
import './styles/common.css';
import 'react-app-polyfill/stable';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Home } from './views/Home/Home';
import { setTheme } from './utils/style-utils';
import { Config } from './interfaces/config';
import { getConfig } from './utils/config-utils';
import GlobalContextProvider from './utils/context-utils';
import ErrorModal from './components/ErrorModal/ErrorModal';

export function DM3(props: Partial<Config>) {
    const propsData: Config = getConfig(props);
    setTheme(propsData.theme);

    return (
        <div className="container-fluid">
            <ErrorModal />
            <GlobalContextProvider>
                <Home config={propsData} />
            </GlobalContextProvider>
        </div>
    );
}
