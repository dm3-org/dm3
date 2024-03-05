import './styles/index.css';
import './styles/common.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ErrorModal from './components/ErrorModal/ErrorModal';
import { Config, DM3Configuration } from './interfaces/config';
import { getConfig } from './utils/config-utils';
import GlobalContextProvider from './utils/context-utils';
import { setTheme } from './utils/style-utils';
import { Home } from './views/Home/Home';

export function DM3(props: DM3Configuration) {
    const propsData: Config = getConfig(props);
    setTheme(propsData.theme);
    return (
        <>
            <div className="dm3-root">
                <ErrorModal />
                <GlobalContextProvider>
                    <Home config={propsData} dm3Configuration={props} />
                </GlobalContextProvider>
            </div>
            {process.env.REACT_APP_COMMIT_HASH && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '0',
                        backdropFilter: 'blur(5px)',
                        background: 'rgba(255,174,52,.1)',
                        color: 'rgba(255,174,52,.9)',
                        zIndex: '9999999',
                        fontFamily: 'monospace',
                    }}
                    className="w-100 text-center"
                >
                    STAGING {process.env.REACT_APP_BUILD_TIME}{' '}
                    {process.env.BRANCH} {process.env.REACT_APP_COMMIT_HASH}
                </div>
            )}
        </>
    );
}
