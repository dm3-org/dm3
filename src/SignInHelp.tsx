import './App.css';
import Icon from './Icon';

function SignInHelp() {
    return (
        <div className="row d-flex justify-content-center row-space text-start">
            <p>
                <Icon iconClass="fas fa-arrow-left" />{' '}
                <strong>1. Connect an Ethereum account</strong>
            </p>
            <p className="row-space">
                <Icon iconClass="fas fa-arrow-left" />{' '}
                <strong>2. Sign in to proof your account ownership</strong>
            </p>
        </div>
    );
}

export default SignInHelp;
