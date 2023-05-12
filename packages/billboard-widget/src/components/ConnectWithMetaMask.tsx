import { useMetaMask } from '../hooks/metaMaskProvider';

export interface Props {
    noProviderMessage?: string;
    buttonTitle?: string;
}

function ConnectWithMetaMask(props: Props) {
    const {
        noProviderMessage = 'You need to install MetaMask',
        buttonTitle = 'Connect MetaMask',
    } = props;
    const { hasProvider, handleConnect } = useMetaMask();

    return (
        <div className="connectMetaMask">
            {hasProvider ? (
                <button onClick={handleConnect} className="connectButton">
                    {buttonTitle}
                </button>
            ) : (
                <p>{noProviderMessage}</p>
            )}
        </div>
    );
}

export default ConnectWithMetaMask;
