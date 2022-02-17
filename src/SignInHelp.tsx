import './App.css';

function SignInHelp() {
    return (
        <div className="row d-flex justify-content-center row-space text-start">
            <div className="d-flex justify-content-start">
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">1</div>
                <div>Connect an Ethereum account</div>
            </div>
            <div className="sign-in-help d-flex justify-content-start">
                <div className="arrow-left h-100" />
                <div className="circle-char text-center">2</div>
                <div>Sign in to proof your account ownership</div>
            </div>
        </div>
    );
}

export default SignInHelp;
