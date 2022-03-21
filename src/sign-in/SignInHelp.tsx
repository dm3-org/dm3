import './SignInHelp.css';
import * as Lib from '../lib';
import { connectionPhase } from './Phases';

interface SignInHelpProps {
    existingAccount: boolean;
    connectionState: Lib.ConnectionState;
}

function SignInHelp(props: SignInHelpProps) {
    return (
        <div className="row d-flex justify-content-center row-space text-start">
            <div className="d-flex justify-content-start sign-in-help">
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">1</div>
                <div>Connect an Ethereum account</div>
            </div>
            {!connectionPhase(props.connectionState) && (
                <>
                    {props.existingAccount && (
                        <div className="sign-in-help-1 d-flex justify-content-start">
                            <div className="arrow-left h-100" />
                            <div className="circle-char text-center">2</div>
                            <div>
                                {props.existingAccount
                                    ? 'Choose storage file'
                                    : 'Select storage location'}
                            </div>
                        </div>
                    )}
                    {!props.existingAccount &&
                        !connectionPhase(props.connectionState) && (
                            <div className="sign-in-help-1 d-flex justify-content-start">
                                <div className="arrow-left h-100" />
                                <div className="circle-char text-center">2</div>
                                <div>Select storage location</div>
                            </div>
                        )}

                    <div
                        className=" d-flex justify-content-start"
                        style={
                            connectionPhase(props.connectionState)
                                ? { marginTop: '2.8rem' }
                                : props.existingAccount
                                ? { marginTop: '2rem' }
                                : { marginTop: '4.8rem' }
                        }
                    >
                        <div className="arrow-left h-100" />
                        <div className="circle-char text-center">
                            {props.existingAccount ||
                            !connectionPhase(props.connectionState)
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
