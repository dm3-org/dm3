import * as Lib from '../lib';
import { connectionPhase } from './Phases';
import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';

function SignInHelp() {
    const existingAccount = true;
    const { state } = useContext(GlobalContext);
    return (
        <div className="row d-flex justify-content-center row-space text-start">
            <div className="d-flex justify-content-start sign-in-help">
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">1</div>
                <div>Connect an Ethereum account</div>
            </div>
            {!connectionPhase(state.connection.connectionState) && (
                <>
                    {existingAccount && (
                        <div className="sign-in-help-1 d-flex justify-content-start">
                            <div className="arrow-left h-100" />
                            <div className="circle-char text-center">2</div>
                            <div>
                                {existingAccount
                                    ? 'Choose storage file'
                                    : 'Select storage location'}
                            </div>
                        </div>
                    )}
                    {!existingAccount &&
                        !connectionPhase(state.connection.connectionState) && (
                            <div className="sign-in-help-1 d-flex justify-content-start">
                                <div className="arrow-left h-100" />
                                <div className="circle-char text-center">2</div>
                                <div>Select storage location</div>
                            </div>
                        )}

                    <div
                        className=" d-flex justify-content-start"
                        style={
                            connectionPhase(state.connection.connectionState)
                                ? { marginTop: '2.8rem' }
                                : existingAccount
                                ? { marginTop: '2rem' }
                                : { marginTop: '4.8rem' }
                        }
                    >
                        <div className="arrow-left h-100" />
                        <div className="circle-char text-center">
                            {existingAccount ||
                            !connectionPhase(state.connection.connectionState)
                                ? '3'
                                : '2'}
                        </div>
                        <div>Sign in to proof your account ownership</div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SignInHelp;
