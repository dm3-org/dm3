import './Siwe.css';
import { signInImage } from '../../assets/base64/home-image';
import { useContext, useEffect } from 'react';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { SiweValidityStatus } from '../../utils/enum-type-utils';
import { AuthContext } from '../../context/AuthContext';

export function Siwe({
    backgroundImage,
}: {
    backgroundImage: string | undefined;
}) {
    const { siweSignIn } = useContext(AuthContext);
    const { siweValidityStatus } = useContext(DM3ConfigurationContext);
    //When a SIWE message is provided, the logging happens automatically and the user is signed using the secret of the siweStruct as a private key
    //This account has a random address and has no connection to the account that has been used to sign the siwe message.
    //In the future we can either use the dm3name to establish a relation or use LSP
    useEffect(() => {
        if (siweValidityStatus !== SiweValidityStatus.VALIDATED) {
            console.log('Invalid SIWE credentials');
            return;
        }
        //call siwe SignIn function to execute siwe based login
        siweSignIn();
    }, [siweValidityStatus]);

    return (
        <div className="h-100">
            <div className="row m-0 p-0 h-100">
                <div
                    style={{
                        backgroundImage: `url(${
                            backgroundImage ?? signInImage
                        })`,
                    }}
                    className="col-12 p-0 h-100 siwe-image-container background-container"
                ></div>
            </div>
        </div>
    );
}
