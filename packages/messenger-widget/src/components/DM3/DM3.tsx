import { Siwe } from '../Siwe/Siwe';
import { SignIn } from '../SignIn/SignIn';
import { useContext, useEffect } from 'react';
import { startLoader } from '../Loader/Loader';
import { Dm3Props } from '../../interfaces/config';
import Dashboard from '../../views/Dashboard/Dashboard';
import { AuthContext } from '../../context/AuthContext';
import { GlobalContext } from '../../utils/context-utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import {
    ModalStateType,
    SiweValidityStatus,
} from '../../utils/enum-type-utils';

function DM3(props: Dm3Props) {
    const { dispatch } = useContext(GlobalContext);

    const {
        setDm3Configuration,
        setScreenWidth,
        setSiweValidityStatus,
        validateSiweCredentials,
        siweValidityStatus,
    } = useContext(DM3ConfigurationContext);

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

    // validate SIWE credentials
    useEffect(() => {
        const validateSiwe = async () => {
            if (props.dm3Configuration.siwe) {
                dispatch({
                    type: ModalStateType.LoaderContent,
                    payload: 'Validating SIWE credentials',
                });
                startLoader();
                setSiweValidityStatus(SiweValidityStatus.IN_PROGRESS);
                await validateSiweCredentials(props.dm3Configuration.siwe);
            }
        };
        validateSiwe();
    }, []);

    return (
        <div id="data-rk-child" className="h-100">
            {!isLoggedIn ? (
                props.dm3Configuration.siwe ? (
                    <Siwe backgroundImage={props.config.signInImage} />
                ) : (
                    <SignIn
                        hideStorageSelection={props.config.hideStorageSelection}
                        defaultStorageLocation={
                            props.config.defaultStorageLocation
                        }
                        miniSignIn={props.config.miniSignIn}
                        signInImage={props.config.signInImage as string}
                    />
                )
            ) : (
                <div className="h-100 background-container">
                    <Dashboard dm3Props={props} />
                </div>
            )}
        </div>
    );
}

export default DM3;
