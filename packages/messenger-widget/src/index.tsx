import './index.css';
import 'react-app-polyfill/stable';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Home } from './views/Home/Home';

export function DM3() {

    return (
        <div className={"container-fluid outer-container"}>
            <Home />
        </div>
    );
}
