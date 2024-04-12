import './polyfills';
import './styles/index.css';
import './styles/common.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ErrorModal from './components/ErrorModal/ErrorModal';
import { DM3Configuration, Siwe } from './interfaces/config';
import { setTheme } from './utils/style-utils';
import { Home } from './views/Home/Home';

function DM3(props: DM3Configuration) {
    setTheme(props.theme);
    return (
        <>
            <div className="dm3-root">
                <ErrorModal />
                <Home config={props} />
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

// The DM3 component to be included for the widget
export { DM3 };

// The configuration props to configure the DM3 widget & SIWE object
export type { DM3Configuration, Siwe };
