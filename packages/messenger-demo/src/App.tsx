import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
//@ts-ignore
import { DM3 } from 'messenger-widget';

function App() {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        showAlways: true,
    };

    return (
        <>
            <DM3 {...props} />
        </>
    );
}

export default App;
