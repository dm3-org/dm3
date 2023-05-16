import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useEffect } from 'react'

export interface Props {
    noProviderMessage?: string;
    buttonTitle?: string;
}

function ConnectWithMetaMask(props: Props) {
    const { buttonTitle = 'Login with Web3' } = props;

    const { getProfileKeys } = useContext(AuthContext);

    useEffect(() => {
        const x = async () => {
            console.log(await getProfileKeys());
        };
        x();
    }, []);
    return (
        <div className="connectMetaMask">
            <button onClick={() => {}}>{buttonTitle}</button>
        </div>
    );
}

export default ConnectWithMetaMask;
