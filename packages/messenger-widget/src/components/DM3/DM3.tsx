/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Dm3Props } from '../../interfaces/config';
import { GlobalContext } from '../../utils/context-utils';
import { ConnectionType } from '../../utils/enum-type-utils';
import Dashboard from '../../views/Dashboard/Dashboard';
import { SignIn } from '../SignIn/SignIn';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

function DM3(props: Dm3Props) {
    // fetches context storage
    const { dispatch } = useContext(GlobalContext);

    const { setDm3Configuration, setScreenWidth, screenWidth } = useContext(DM3ConfigurationContext);

    const { isLoggedIn, account, deliveryServiceToken } =
        useContext(AuthContext);

    // handles changes of state on connection to the account
    //TODO refactor to useAuth
    useEffect(() => {
        if (props.config.connectionStateChange) {
            props.config.connectionStateChange(isLoggedIn);
        }
    }, [isLoggedIn]);

    // TODO what is this doing?
    useEffect(() => {
        dispatch({
            type: ConnectionType.SetDefaultServiceUrl,
            payload: props.config.defaultServiceUrl,
        });
    }, [props.config.defaultServiceUrl]);

    // updates rainbow kit provider height to 100% when rendered
    useEffect(() => {
        const childElement = document.getElementById('data-rk-child');
        if (childElement && childElement.parentElement) {
            childElement.parentElement.classList.add('h-100');
        }

        // sets the DM3 confguration provided from props
        setDm3Configuration(props.dm3Configuration);
    }, []);

    // This handles the responsive check of widget
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
