import { useContext } from 'react';
import { SignInProps } from '../../interfaces/web3';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { MobileSignIn } from './MobileSignIn';
import { WebSignIn } from './WebSignIn';

export function SignIn(props: SignInProps) {

    const { screenWidth } = useContext(DM3ConfigurationContext);

    return (
        <>
            {screenWidth < 800 ?
                <MobileSignIn {...props} /> :
                <WebSignIn {...props} />
            }
        </>
    );
}
