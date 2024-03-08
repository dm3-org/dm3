import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Dm3Props } from '../../interfaces/config';
import Dashboard from '../../views/Dashboard/Dashboard';
import { SignIn } from '../SignIn/SignIn';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

function DM3(props: Dm3Props) {
    const { setDm3Configuration } = useContext(DM3ConfigurationContext);

    const { isLoggedIn } = useContext(AuthContext);

    // updates rainbow kit provider height to 100% when rendered
    useEffect(() => {
        const childElement = document.getElementById('data-rk-child');
        if (childElement && childElement.parentElement) {
            childElement.parentElement.classList.add('h-100');
        }

        // sets the DM3 confguration provided from props
        setDm3Configuration(props.dm3Configuration);
    }, []);

    return (
        <div id="data-rk-child" className="h-100">
            {!isLoggedIn ? (
                <SignIn
                    hideStorageSelection={props.config.hideStorageSelection}
                    defaultStorageLocation={props.config.defaultStorageLocation}
                    miniSignIn={props.config.miniSignIn}
                    signInImage={props.config.signInImage as string}
                />
            ) : (
                <div className="h-100 background-container">
                    <Dashboard dm3Props={props} />
                </div>
            )}
        </div>
    );
}

export default DM3;
