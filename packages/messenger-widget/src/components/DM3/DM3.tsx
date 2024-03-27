import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Dm3Props } from '../../interfaces/config';
import Dashboard from '../../views/Dashboard/Dashboard';
import { SignIn } from '../SignIn/SignIn';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ModalStateType, SiweValidityStatus } from '../../utils/enum-type-utils';
import { GlobalContext } from '../../utils/context-utils';
import { closeLoader, startLoader } from '../Loader/Loader';

function DM3(props: Dm3Props) {

    const { dispatch } = useContext(GlobalContext);

    const {
        setDm3Configuration,
        setScreenWidth,
        setSiweValidityStatus,
        validateSiweCredentials,
        siweValidityStatus,
    } = useContext(
        DM3ConfigurationContext,
    );

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
                    payload: "Validating SIWE credentials"
                });
                startLoader();
                setSiweValidityStatus(SiweValidityStatus.IN_PROGRESS);
                await validateSiweCredentials(props.dm3Configuration.siwe);
            }
        }
        validateSiwe();
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
